// ========================================
// LA MIF — Content API (Netlify Blobs)
// GET  /api/content  → public content read
// PUT  /api/content  → update content (requires admin session)
// ========================================

import { getStore } from '@netlify/blobs';

const SESSION_STORE = 'lamif-content';
const SESSION_PREFIX = 'session_';
const MAX_BODY_SIZE = 4 * 1024 * 1024; // 4MB max payload

function parseCookies(header) {
    const cookies = {};
    if (!header) return cookies;
    header.split(';').forEach(function (c) {
        const parts = c.trim().split('=');
        if (parts.length >= 2) cookies[parts[0].trim()] = decodeURIComponent(parts.slice(1).join('='));
    });
    return cookies;
}

function json(data, status, extraHeaders) {
    return new Response(JSON.stringify(data), {
        status: status,
        headers: Object.assign({ 'Content-Type': 'application/json' }, extraHeaders || {})
    });
}

async function parseJsonBody(req) {
    const text = await req.text();
    if (text.length > MAX_BODY_SIZE) { throw new Error('Payload too large (max 4MB)'); }
    if (!text) throw new Error('Empty body');
    return JSON.parse(text);
}

// ── Session validation ──
async function validateSession(req) {
    const cookies = parseCookies(req.headers.get('cookie'));
    const sid = cookies.lamif_session;
    if (!sid) return null;

    const store = getStore(SESSION_STORE);
    const raw = await store.get(SESSION_PREFIX + sid, { type: 'text' });
    if (!raw) return null;

    try {
        const session = JSON.parse(raw);
        if (session.expiresAt < Date.now()) {
            await store.delete(SESSION_PREFIX + sid).catch(function () {});
            return null;
        }
        if (session.role !== 'admin') return null;
        return session;
    } catch (e) {
        return null;
    }
}

// ── Input validation ──
const ALLOWED_TOP_KEYS = [
    'version', 'general', 'hero', 'volcano', 'especialidad', 'nosotros',
    'menu', 'resenas', 'pedido', 'ubicacion', 'footer', 'seo', 'marquee'
];

const STRING_FIELDS = new Set([
    'nombre', 'lema', 'eslogan', 'telefono', 'telefonoDisplay', 'whatsappLabel',
    'addressLine1', 'addressLine2', 'precioDesde', 'precioHasta', 'rating',
    'halalPct', 'whatsapp', 'instagram', 'tiktok', 'glovo', 'ubereats',
    'mapsUrl', 'mapsAppleUrl', 'wazeUrl', 'mapsEmbed', 'goUrl',
    'titulo', 'titulo1', 'titulo2', 'tituloEm', 'tituloEnfasis',
    'subtitulo', 'tagline', 'kicker', 'eyebrow', 'texto', 'descripcion',
    'imagen', 'imagenAlt', 'intro', 'notaGeneral', 'nota', 'complementos',
    'ctaTexto', 'nombre', 'desc', 'badge', 't1', 't2', 'id', 'label',
    'dias', 'horas', 'dt', 'dd', 'n', 'label', 'puntuacion', 'resumen',
    'botonVer', 'dirTitulo', 'dirTexto', 'horTitulo', 'telTitulo',
    'precioTitulo', 'precioTexto', 'direccionModal', 'ctaLlegar',
    'tagline', 'creditos', 'ubicacionHint', 'sello', 'contadorNumero',
    'contadorTexto', 'detalle', 'fecha', 'whatsappLabel'
]);

function validateContent(data) {
    if (!data || typeof data !== 'object') return 'Content must be an object';
    if (Array.isArray(data)) return 'Content must not be an array';

    const keys = Object.keys(data);
    if (keys.length > 20) return 'Too many top-level properties';

    for (const key of keys) {
        if (!ALLOWED_TOP_KEYS.includes(key)) return 'Unexpected property: ' + key;
    }

    if (data.version !== undefined && typeof data.version !== 'number') return 'version must be a number';
    if (data.version !== undefined && (data.version < 0 || data.version > 100)) return 'version out of range';

    for (const sectionKey of ALLOWED_TOP_KEYS) {
        if (sectionKey === 'version') continue;
        const section = data[sectionKey];
        if (section === undefined || section === null) continue;
        if (typeof section !== 'object' || Array.isArray(section)) return sectionKey + ' must be an object';
        if (Object.keys(section).length > 50) return sectionKey + ' has too many properties';
    }

    if (data.general) {
        const g = data.general;
        if (g.nombre !== undefined && typeof g.nombre !== 'string') return 'general.nombre must be a string';
        if (g.telefono !== undefined && typeof g.telefono !== 'string') return 'general.telefono must be a string';
    }

    if (data.menu && data.menu.categorias) {
        if (!Array.isArray(data.menu.categorias)) return 'menu.categorias must be an array';
        if (data.menu.categorias.length > 30) return 'Too many categories';
        for (let i = 0; i < data.menu.categorias.length; i++) {
            const cat = data.menu.categorias[i];
            if (typeof cat !== 'object' || cat === null) return 'Category ' + i + ' must be an object';
            if (cat.items && !Array.isArray(cat.items)) return 'Category ' + i + '.items must be an array';
            if (cat.items && cat.items.length > 100) return 'Category ' + i + ' has too many items';
        }
    }

    if (data.resenas && data.resenas.items) {
        if (!Array.isArray(data.resenas.items)) return 'resenas.items must be an array';
        if (data.resenas.items.length > 50) return 'Too many reviews';
    }

    return null; // valid
}

export default async (req) => {
    // CORS preflight (same-origin, minimal)
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
    }

    try {
        const store = getStore('lamif-content');

        // ── GET (public, no auth) ──
        if (req.method === 'GET') {
            const raw = await store.get('content.json', { type: 'text' });
            return json(raw || 'null', 200);
        }

        // ── PUT (requires admin session) ──
        if (req.method === 'PUT') {
            const session = await validateSession(req);
            if (!session) {
                return json({ error: 'Authentication required. Please log in.' }, 401);
            }

            // Parse and validate body
            let data;
            try { data = await parseJsonBody(req); }
            catch (e) { return json({ error: 'Invalid JSON body: ' + e.message }, 400); }

            const validationError = validateContent(data);
            if (validationError) {
                console.warn('[CONTENT] Validation rejected:', validationError, 'by user:', session.username);
                return json({ error: 'Validation failed: ' + validationError }, 400);
            }

            // Save
            await store.set('content.json', JSON.stringify(data));
            console.log('[CONTENT] Updated by:', session.username, 'at:', new Date().toISOString());

            return json({ ok: true });
        }

        // ── Method not allowed ──
        return json({ error: 'Method not allowed. Use GET or PUT.' }, 405, { 'Allow': 'GET, PUT' });

    } catch (err) {
        console.error('[CONTENT] Unhandled error:', err);
        return json({ error: 'Internal server error.' }, 500);
    }
};

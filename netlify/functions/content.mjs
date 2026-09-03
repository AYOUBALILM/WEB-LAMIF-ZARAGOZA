// ========================================
// LA MIF - API de contenido (Netlify Blobs)
// GET  /api/content  -> devuelve el contenido guardado (null si no existe)
// PUT  /api/content  -> guarda el contenido (requiere clave de admin)
// Syntax funciones Netlify v2 (auto-inyecta Blobs).
// ========================================

import { getStore } from '@netlify/blobs';

const ADMIN_KEY = process.env.LAMIF_ADMIN_TOKEN || 'lamif2026';

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS'
};

export default async (req) => {
    const store = getStore('lamif-content');

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS });
    }

    try {
        if (req.method === 'GET') {
            const raw = await store.get('content.json', { type: 'text' });
            return new Response(raw || 'null', {
                status: 200,
                headers: { 'Content-Type': 'application/json', ...CORS }
            });
        }

        if (req.method === 'PUT') {
            const key = (req.headers.get('x-admin-key') || '').trim();
            if (key !== ADMIN_KEY) {
                return new Response(JSON.stringify({ error: 'Clave de administrador incorrecta.' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json', ...CORS }
                });
            }
            const body = await req.text();
            JSON.parse(body);
            await store.set('content.json', body);
            return new Response(JSON.stringify({ ok: true }), {
                status: 200,
                headers: { 'Content-Type': 'application/json', ...CORS }
            });
        }

        return new Response(JSON.stringify({ error: 'Método no permitido. Usa GET o PUT.' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json', ...CORS }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: String((err && err.message) || err) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...CORS }
        });
    }
};
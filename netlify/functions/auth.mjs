// ========================================
// LA MIF — Authentication endpoint
// POST /api/auth/login   → session cookie
// POST /api/auth/logout  → clear session
// GET  /api/auth/check   → verify session
// ========================================

import { getStore } from '@netlify/blobs';
import { randomBytes, pbkdf2Sync, timingSafeEqual } from 'crypto';

const SESSION_TTL = 24 * 60 * 60; // 24 hours in seconds
const SESSION_STORE = 'lamif-content';
const SESSION_PREFIX = 'session_';
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// In-memory rate limiter (per-function instance)
const loginAttempts = {};

function getRateLimitKey(req) {
    return req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
}

function checkRateLimit(key) {
    const now = Date.now();
    const record = loginAttempts[key];
    if (!record || now - record.start > LOGIN_WINDOW_MS) {
        loginAttempts[key] = { start: now, count: 1 };
        return true;
    }
    record.count++;
    return record.count <= MAX_LOGIN_ATTEMPTS;
}

function isRateLimited(key) {
    const record = loginAttempts[key];
    return record && record.count > MAX_LOGIN_ATTEMPTS && (Date.now() - record.start) <= LOGIN_WINDOW_MS;
}

function parseCookies(header) {
    const cookies = {};
    if (!header) return cookies;
    header.split(';').forEach(function (c) {
        const parts = c.trim().split('=');
        if (parts.length >= 2) cookies[parts[0].trim()] = decodeURIComponent(parts.slice(1).join('='));
    });
    return cookies;
}

function hashPassword(password, salt) {
    return pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function safeHashCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    if (a.length !== b.length) return false;
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}

function generateSessionId() {
    return randomBytes(32).toString('hex');
}

function jsonResponse(data, status, extraHeaders) {
    return new Response(JSON.stringify(data), {
        status: status,
        headers: Object.assign({ 'Content-Type': 'application/json' }, extraHeaders || {})
    });
}

function getCorsHeaders(req) {
    const origin = req.headers.get('origin') || '';
    const allowed = /^https?:\/\/(.*\.)?netlify\.app$/i.test(origin) || /^https?:\/\/lamifzaragoza\.netlify\.app$/i.test(origin);
    return allowed ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true' } : {};
}

function cookieHeaders(name, value, maxAge) {
    const parts = [
        name + '=' + value,
        'Path=/api/',
        'HttpOnly',
        'Secure',
        'SameSite=Lax',
        'Max-Age=' + maxAge
    ];
    return { 'Set-Cookie': parts.join('; ') };
}

async function parseJsonBody(req) {
    const text = await req.text();
    if (text.length > 1024) throw new Error('Payload too large');
    if (!text) throw new Error('Empty body');
    return JSON.parse(text);
}

export default async (req) => {
    const store = getStore(SESSION_STORE);
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/api\/auth/, '');

    // CORS preflight
    if (req.method === 'OPTIONS') {
        const cors = getCorsHeaders(req);
        return new Response(null, { status: 204, headers: Object.assign({ 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }, cors) });
    }

    try {
        // ── POST /api/auth/login ──
        if (req.method === 'POST' && path === '/login') {
            const rateLimitKey = getRateLimitKey(req);
            if (isRateLimited(rateLimitKey)) {
                console.warn('[AUTH] Rate limited login attempt from:', rateLimitKey);
                return jsonResponse({ error: 'Too many attempts. Try again in 15 minutes.' }, 429);
            }

            const ADMIN_USERNAME = process.env.LAMIF_ADMIN_USERNAME || 'admin';
            const ADMIN_PASSWORD_HASH = process.env.LAMIF_ADMIN_PASSWORD_HASH;
            const ADMIN_SALT = process.env.LAMIF_ADMIN_SALT;

            if (!ADMIN_PASSWORD_HASH || !ADMIN_SALT) {
                console.error('[AUTH] LAMIF_ADMIN_PASSWORD_HASH and LAMIF_ADMIN_SALT env vars not configured');
                return jsonResponse({ error: 'Server not configured.' }, 500);
            }

            let body;
            try { body = await parseJsonBody(req); }
            catch (e) { return jsonResponse({ error: 'Invalid request body.' }, 400); }

            const username = (body.username || '').trim();
            const password = body.password || '';

            if (!username || !password) {
                return jsonResponse({ error: 'Username and password are required.' }, 400);
            }

            if (username !== ADMIN_USERNAME) {
                checkRateLimit(rateLimitKey);
                console.warn('[AUTH] Login attempt with invalid username: ' + username);
                return jsonResponse({ error: 'Invalid credentials.' }, 401);
            }

            const hash = hashPassword(password, ADMIN_SALT);
            if (!safeHashCompare(hash, ADMIN_PASSWORD_HASH)) {
                checkRateLimit(rateLimitKey);
                console.warn('[AUTH] Login attempt with invalid password for user: ' + username);
                return jsonResponse({ error: 'Invalid credentials.' }, 401);
            }

            // Create session
            const sessionId = generateSessionId();
            const session = {
                id: sessionId,
                username: username,
                role: 'admin',
                createdAt: Date.now(),
                expiresAt: Date.now() + (SESSION_TTL * 1000)
            };
            await store.set(SESSION_PREFIX + sessionId, JSON.stringify(session));

            console.log('[AUTH] Successful login for user: ' + username);

            return jsonResponse(
                { ok: true, username: username },
                200,
                cookieHeaders('lamif_session', sessionId, SESSION_TTL)
            );
        }

        // ── POST /api/auth/logout ──
        if (req.method === 'POST' && path === '/logout') {
            const cookies = parseCookies(req.headers.get('cookie'));
            const sid = cookies.lamif_session;
            if (sid) {
                await store.delete(SESSION_PREFIX + sid).catch(function () {});
                console.log('[AUTH] Session deleted: ' + sid.substring(0, 8) + '...');
            }
            return jsonResponse(
                { ok: true },
                200,
                cookieHeaders('lamif_session', '', 0)
            );
        }

        // ── GET /api/auth/check ──
        if (req.method === 'GET' && path === '/check') {
            const cookies = parseCookies(req.headers.get('cookie'));
            const sid = cookies.lamif_session;
            if (!sid) return jsonResponse({ authenticated: false }, 200);

            const raw = await store.get(SESSION_PREFIX + sid, { type: 'text' });
            if (!raw) return jsonResponse({ authenticated: false }, 200);

            try {
                const session = JSON.parse(raw);
                if (session.expiresAt < Date.now()) {
                    await store.delete(SESSION_PREFIX + sid).catch(function () {});
                    return jsonResponse({ authenticated: false, reason: 'expired' }, 200);
                }
                return jsonResponse({ authenticated: true, username: session.username, role: session.role }, 200);
            } catch (e) {
                return jsonResponse({ authenticated: false }, 200);
            }
        }

        return jsonResponse({ error: 'Not found.' }, 404);

    } catch (err) {
        console.error('[AUTH] Unhandled error:', err);
        return jsonResponse({ error: 'Internal server error.' }, 500);
    }
};

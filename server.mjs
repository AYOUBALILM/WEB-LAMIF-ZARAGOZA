// ========================================
// LA MIF — Localhost Server
// API auth/content + static files + git push on save
// Zero dependencies (Node.js built-ins only)
// Usage: node server.mjs [--port 4173]
// ========================================

import { createServer } from 'node:http';
import { createHmac, pbkdf2Sync, timingSafeEqual } from 'node:crypto';
import { readFile, writeFile, stat, mkdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const exec = promisify(execFile);
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = __dirname;

// ── CLI args ──
const { values: flags } = parseArgs({ options: { port: { type: 'string', short: 'p' } } });
const PORT = parseInt(flags.port || process.env.PORT || '4173', 10);

// ── Env loader (.env.local) ──
function loadEnvLocal() {
  const envPath = join(ROOT, '.env.local');
  const env = {};
  try {
    const raw = readFile(envPath, 'utf8');
    // Sync read is fine at startup
    const lines = raw.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      let key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      // Strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  } catch {}
  // Set env vars from .env.local only if not already set in real env
  for (const [k, v] of Object.entries(env)) {
    if (!(k in process.env)) process.env[k] = v;
  }
}
loadEnvLocal();

// ── Credentials (fallback to known values) ──
const ADMIN_USERNAME = process.env.LAMIF_ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.LAMIF_ADMIN_PASSWORD_HASH
  || 'dcb08ec8b880c098e2bdb5f5484e3042700a44ba47331786b6ef28deb8c5686da18b1bd5539b3fce7d32b22cf1615c616d8b4f9bce99ac3a3b8eb71ec2e703f7';
const ADMIN_SALT = process.env.LAMIF_ADMIN_SALT
  || '39b3dcf23a84d6d833e68978e178de9a8c5fc8861861a8b288a2ca55cd4190fa';
const AUTH_SECRET = process.env.LAMIF_AUTH_SECRET
  || '19dd20e0682ed3922e2d94a259fd7f259fadf8a79b6c8a36f64acdb97a4a8e55';

// ── Content file path ──
const CONTENT_FILE = join(ROOT, 'data', 'content.json');

// ── Rate limiter ──
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24h in ms
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW = 15 * 60 * 1000;

function checkRate(ip) {
  const now = Date.now();
  const rec = loginAttempts.get(ip);
  if (!rec || now - rec.start > WINDOW) {
    loginAttempts.set(ip, { start: now, count: 1 });
    return true;
  }
  rec.count++;
  return rec.count <= MAX_ATTEMPTS;
}
function isLimited(ip) {
  const rec = loginAttempts.get(ip);
  return rec && rec.count > MAX_ATTEMPTS && (Date.now() - rec.start) <= WINDOW;
}

// ── Crypto helpers ──
function hashPw(pw, salt) {
  return pbkdf2Sync(pw, salt, 100000, 64, 'sha512').toString('hex');
}
function safeCmp(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}
function sign(data) {
  return createHmac('sha256', AUTH_SECRET).update(data).digest('base64url');
}
function createToken(username) {
  const payload = Buffer.from(JSON.stringify({
    u: username, r: 'admin',
    exp: Date.now() + SESSION_TTL
  })).toString('base64url');
  return payload + '.' + sign(payload);
}
function validateToken(cookie) {
  if (!cookie) return null;
  const dot = cookie.indexOf('.');
  if (dot <= 0) return null;
  const payload = cookie.slice(0, dot);
  const sig = cookie.slice(dot + 1);
  if (!AUTH_SECRET) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig || ''), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  let parsed;
  try { parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()); } catch { return null; }
  if (!parsed.exp || parsed.exp < Date.now() || parsed.r !== 'admin') return null;
  return { username: parsed.u, role: 'admin' };
}

// ── Content sanitization (mirrors api/_shared.js) ──
function stripHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '')
    .replace(/<link[\s\S]*?>/gi, '')
    .replace(/<meta[\s\S]*?>/gi, '')
    .replace(/<base[\s\S]*?>/gi, '')
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|`[^`]*`|[^\s>]+)/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
}
function sanitize(obj) {
  if (typeof obj === 'string') return stripHtml(obj);
  if (Array.isArray(obj)) return obj.map(sanitize);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const k of Object.keys(obj)) out[k] = sanitize(obj[k]);
    return out;
  }
  return obj;
}

const ALLOWED_KEYS = [
  'version','general','hero','volcano','especialidad','nosotros',
  'menu','resenas','pedido','ubicacion','footer','seo','marquee','tema','horarioEsquema'
];
function validate(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 'Content must be an object';
  if (Object.keys(data).length > 20) return 'Too many top-level properties';
  for (const key of Object.keys(data)) {
    if (!ALLOWED_KEYS.includes(key)) return 'Unexpected property: ' + key;
  }
  if (data.version !== undefined && typeof data.version !== 'number') return 'version must be a number';
  for (const s of ALLOWED_KEYS) {
    if (s === 'version' || data[s] === undefined || data[s] === null) continue;
    if (typeof data[s] !== 'object') return s + ' must be an object';
    if (Array.isArray(data[s]) && s !== 'horarioEsquema') return s + ' must be an object';
    if (Object.keys(data[s]).length > 50) return s + ' has too many properties';
  }
  if (data.tema) {
    const t = data.tema;
    if (t.colors && typeof t.colors !== 'object') return 'tema.colors must be an object';
    if (t.fonts && typeof t.fonts !== 'object') return 'tema.fonts must be an object';
    if (t.animations && typeof t.animations !== 'object') return 'tema.animations must be an object';
    const re = /^#[0-9a-fA-F]{3,8}$/;
    if (t.colors) for (const [k, v] of Object.entries(t.colors)) {
      if (typeof v !== 'string') return 'tema.colors.' + k + ' must be a string';
      if (k !== 'brandTag' && !re.test(v)) return 'tema.colors.' + k + ' invalid hex color';
    }
  }
  return null;
}

// ── HTTP helpers ──
function json(data, status, extra) {
  const headers = { 'Content-Type': 'application/json' };
  if (extra) Object.assign(headers, extra);
  return { status, headers, body: JSON.stringify(data) };
}

function setCors(res, origin) {
  const allowed = origin && (
    origin.includes('localhost')
    || origin.includes('127.0.0.1')
    || /\.vercel\.app$/i.test(origin)
    || /\.netlify\.app$/i.test(origin)
  );
  if (allowed) {
    res.headers['Access-Control-Allow-Origin'] = origin;
    res.headers['Access-Control-Allow-Credentials'] = 'true';
  }
  res.headers['Access-Control-Allow-Methods'] = 'GET, PUT, POST, OPTIONS';
  res.headers['Access-Control-Allow-Headers'] = 'Content-Type';
}

// ── Cookie parser ──
function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  for (const c of header.split(';')) {
    const p = c.trim().split('=');
    if (p.length >= 2) cookies[p[0].trim()] = decodeURIComponent(p.slice(1).join('='));
  }
  return cookies;
}

// ── Git helpers ──
async function gitPush(filePath) {
  try {
    const rel = filePath.replace(ROOT + '/', '');
    await exec('git', ['add', rel], { cwd: ROOT });
    // Commit (exit 1 = nothing to commit, not an error)
    try {
      await exec('git', ['commit', '-m', 'Update site content via admin panel', '--', rel], { cwd: ROOT });
    } catch (e) {
      if (e.code === 1 || (e.stderr || '').includes('nothing to commit')) return { committed: false };
      throw e;
    }
    // Push
    await exec('git', ['push', 'origin', 'main'], { cwd: ROOT });
    return { committed: true, pushed: true };
  } catch (e) {
    console.error('[GIT]', e.message);
    return { committed: false, pushed: false, error: e.message };
  }
}

// ── Static file MIME types ──
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

// ── Static file server ──
async function serveStatic(path) {
  // Block dangerous paths
  if (path.includes('\0') || path.includes('..')) return null;

  let filePath = join(ROOT, path === '/' ? 'index.html' : path);

  // Block .git, .vercel, node_modules, .env, etc
  const parts = filePath.split('/').filter(Boolean);
  if (parts.some(p => p.startsWith('.') && p !== '.env.local') || parts.includes('node_modules')) return null;

  try {
    const st = await stat(filePath);
    if (st.isDirectory()) {
      filePath = join(filePath, 'index.html');
    }
    const content = await readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    return {
      status: 200,
      headers: {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': ext === '.html' ? 'public, max-age=0, must-revalidate' : 'public, max-age=31536000, immutable',
      },
      body: content,
    };
  } catch {
    return null;
  }
}

// ── Request handler ──
async function handleRequest(req, res) {
  const url = new URL(req.url, 'http://localhost:' + PORT);
  const pathname = url.pathname;
  const method = req.method;
  const h = req.headers || {};
  const getH = (name) => h[name.toLowerCase()] || h[name] || '';
  const origin = getH('origin');
  const clientIp = getH('x-forwarded-for') || req.socket.remoteAddress || 'unknown';

  // CORS headers (set on every response)
  const corsRes = { headers: {} };
  setCors(corsRes, origin);
  const corsHeaders = corsRes.headers;

  // Handle preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    return res.end();
  }

  // ── API: /api/auth/* ──
  if (pathname.startsWith('/api/auth')) {
    const sub = pathname.replace(/^\/api\/auth/, '');
    const cookies = parseCookies(getH('cookie'));

    if (method === 'POST' && sub === '/login') {
      let body = '';
      for await (const chunk of req) body += chunk;
      if (body.length > 4 * 1024 * 1024) { res.writeHead(400, corsHeaders); return res.end('{"error":"Payload too large"}'); }
      let parsed;
      try { parsed = JSON.parse(body); } catch { res.writeHead(400, corsHeaders); return res.end('{"error":"Invalid JSON"}'); }
      const username = (parsed.username || '').trim();
      const password = parsed.password || '';

      if (!username || !password) { res.writeHead(400, corsHeaders); return res.end('{"error":"Username and password are required."}'); }
      if (!AUTH_SECRET) { res.writeHead(500, corsHeaders); return res.end('{"error":"Server not configured."}'); }

      if (isLimited(clientIp)) {
        res.writeHead(429, corsHeaders); return res.end('{"error":"Too many attempts. Try again in 15 minutes."}');
      }
      if (username !== ADMIN_USERNAME) {
        checkRate(clientIp);
        res.writeHead(401, corsHeaders); return res.end('{"error":"Invalid credentials."}');
      }
      const hash = hashPw(password, ADMIN_SALT);
      if (!safeCmp(hash, ADMIN_PASSWORD_HASH)) {
        checkRate(clientIp);
        res.writeHead(401, corsHeaders); return res.end('{"error":"Invalid credentials."}');
      }

      const token = createToken(username);
      const cookie = 'lamif_session=' + token + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400';
      res.writeHead(200, { ...corsHeaders, 'Set-Cookie': cookie });
      return res.end(JSON.stringify({ ok: true, username }));
    }

    if (method === 'POST' && sub === '/logout') {
      res.writeHead(200, { ...corsHeaders, 'Set-Cookie': 'lamif_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0' });
      return res.end('{"ok":true}');
    }

    if (method === 'GET' && sub === '/check') {
      const session = validateToken(cookies.lamif_session);
      if (!session) { res.writeHead(200, corsHeaders); return res.end('{"authenticated":false}'); }
      res.writeHead(200, corsHeaders);
      return res.end(JSON.stringify({ authenticated: true, username: session.username, role: session.role }));
    }

    res.writeHead(404, corsHeaders); return res.end('{"error":"Not found"}');
  }

  // ── API: /api/content ──
  if (pathname === '/api/content') {
    const cookies = parseCookies(getH('cookie'));

    if (method === 'GET') {
      try {
        const data = await readFile(CONTENT_FILE, 'utf8');
        res.writeHead(200, corsHeaders); return res.end(data);
      } catch {
        res.writeHead(200, corsHeaders); return res.end('null');
      }
    }

    if (method === 'PUT') {
      const session = validateToken(cookies.lamif_session);
      if (!session) { res.writeHead(401, corsHeaders); return res.end('{"error":"Authentication required. Please log in."}'); }

      let body = '';
      for await (const chunk of req) body += chunk;
      if (body.length > 4 * 1024 * 1024) { res.writeHead(400, corsHeaders); return res.end('{"error":"Payload too large"}'); }

      let data;
      try { data = JSON.parse(body); } catch { res.writeHead(400, corsHeaders); return res.end('{"error":"Invalid JSON body"}'); }

      const err = validate(data);
      if (err) { res.writeHead(400, corsHeaders); return res.end(JSON.stringify({ error: 'Validation failed: ' + err })); }

      const clean = sanitize(data);

      // Write to disk
      await mkdir(join(ROOT, 'data'), { recursive: true });
      await writeFile(CONTENT_FILE, JSON.stringify(clean, null, 2), 'utf8');
      console.log('[CONTENT] Saved by:', session.username, 'at:', new Date().toISOString());

      // Git push
      const result = await gitPush(CONTENT_FILE);
      if (result.pushed) console.log('[CONTENT] Pushed to GitHub ✓');
      else if (result.committed) console.log('[CONTENT] Committed locally (push failed):', result.error || '');
      else console.log('[CONTENT] No changes to commit');

      res.writeHead(200, corsHeaders);
      return res.end(JSON.stringify({ ok: true, pushed: !!result.pushed }));
    }

    res.writeHead(405, { ...corsHeaders, 'Allow': 'GET, PUT' }); return res.end('{"error":"Method not allowed"}');
  }

  // ── Static files ──
  const staticResult = await serveStatic(pathname);
  if (staticResult) {
    res.writeHead(staticResult.status, staticResult.headers);
    return res.end(staticResult.body);
  }

  // ── 404 ──
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<!DOCTYPE html><html><body><h1>404</h1></body></html>');
}

// ── Start server ──
const server = createServer(async (req, res) => {
  try { await handleRequest(req, res); }
  catch (e) { console.error('[ERROR]', e); res.writeHead(500); res.end('Internal error'); }
});

server.listen(PORT, () => {
  console.log('');
  console.log('  La Mif Admin Server');
  console.log('  ===================');
  console.log('  Site:    http://localhost:' + PORT);
  console.log('  Admin:   http://localhost:' + PORT + '/admin.html');
  console.log('');
  console.log('  Credenciales: admin / Lamifzaz2026');
  console.log('  Cambios se guardan en data/content.json + git push a GitHub');
  console.log('  La página pública lee desde GitHub CDN');
  console.log('');
});

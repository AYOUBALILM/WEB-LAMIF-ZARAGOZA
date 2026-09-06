// ========================================
// LA MIF — Main JavaScript
// Renderiza toda la web desde window.LaMIF_CONTENT
// y aplica automáticamente los cambios guardados
// en el panel de administración (/api/content).
// ========================================

(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function sanitizeHtml(str) {
        var s = String(str == null ? '' : str);
        var allowed = ['strong', 'em', 'br', 'p', 'small'];
        s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
        s = s.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
        s = s.replace(/<object[\s\S]*?<\/object>/gi, '');
        s = s.replace(/<embed[\s\S]*?>/gi, '');
        s = s.replace(/<svg[\s\S]*?<\/svg>/gi, '');
        s = s.replace(/<form[\s\S]*?<\/form>/gi, '');
        s = s.replace(/<link[\s\S]*?>/gi, '');
        s = s.replace(/<meta[\s\S]*?>/gi, '');
        s = s.replace(/<base[\s\S]*?>/gi, '');
        s = s.replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|`[^`]*`|[^\s>]+)/gi, '');
        s = s.replace(/<([a-z][a-z0-9]*)\b[^>]*>/gi, function (m, tag) {
            return allowed.indexOf(tag.toLowerCase()) !== -1 ? m : '';
        });
        s = s.replace(/<\/([a-z][a-z0-9]*)\b[^>]*>/gi, function (m, tag) {
            return allowed.indexOf(tag.toLowerCase()) !== -1 ? m : '';
        });
        return s;
    }

    function safeHref(url) {
        var s = String(url == null ? '' : url).trim();
        if (!s) return '#';
        if (/^javascript:/i.test(s) || /^data:/i.test(s) || /^vbscript:/i.test(s) || /^blob:/i.test(s)) return '#';
        return s;
    }

    function pick(obj, path, def) {
        return (path || []).reduce(function (o, k) { return (o && o[k] !== undefined) ? o[k] : undefined; }, obj) || def;
    }

    // ============================================================
    // TEMA (colores, fuentes y animaciones desde el panel)
    // ============================================================
    const FONT_SAFE = {
        "'Bebas Neue'": { stack: "'Bebas Neue', 'Arial Narrow', sans-serif", gf: 'Bebas+Neue' },
        "'Oswald'": { stack: "'Oswald', 'Arial Narrow', sans-serif", gf: 'Oswald:wght@400;600;700' },
        "'Anton'": { stack: "'Anton', 'Arial Narrow', sans-serif', sans-serif", gf: 'Anton' },
        "'Playfair Display'": { stack: "'Playfair Display', Georgia, serif", gf: 'Playfair+Display:wght@700;800' },
        "'Montserrat'": { stack: "'Montserrat', sans-serif", gf: 'Montserrat:wght@700;800;900' },
        "'Poppins'": { stack: "'Poppins', sans-serif", gf: 'Poppins:wght@700;800' },
        "'Raleway'": { stack: "'Raleway', sans-serif", gf: 'Raleway:wght@700;900' }
    };
    const BODY_SAFE = {
        "'Inter'": { stack: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", gf: 'Inter:wght@400;600;700' },
        "'Montserrat'": { stack: "'Montserrat', -apple-system, sans-serif", gf: 'Montserrat:wght@400;600;700' },
        "'Poppins'": { stack: "'Poppins', -apple-system, sans-serif", gf: 'Poppins:wght@400;500;600' },
        "'Open Sans'": { stack: "'Open Sans', -apple-system, sans-serif", gf: 'Open+Sans:wght@400;600;700' },
        "'Raleway'": { stack: "'Raleway', -apple-system, sans-serif", gf: 'Raleway:wght@400;600;700' },
        "'Nunito Sans'": { stack: "'Nunito Sans', -apple-system, sans-serif", gf: 'Nunito+Sans:wght@400;700' }
    };
    const FONT_LINKED = {};

    function hexToRgb(hex) {
        var s = String(hex || '').trim().replace(/^#/, '');
        if (s.length !== 6) return null;
        var n = parseInt(s, 16);
        if (isNaN(n)) return null;
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }

    function injectFont(family) {
        if (!family || FONT_LINKED[family]) return;
        var key = family.replace(/^['"]|['"]$/g, '');
        var safe = (FONT_SAFE[family] || BODY_SAFE[family]);
        if (!safe) return;
        FONT_LINKED[family] = true;
        if (!document.querySelector('link[data-theme-font="1"]')) {
            var pre = document.createElement('link');
            pre.rel = 'preconnect';
            pre.href = 'https://fonts.googleapis.com';
            document.head.appendChild(pre);
            pre = document.createElement('link');
            pre.rel = 'preconnect';
            pre.href = 'https://fonts.gstatic.com';
            pre.crossOrigin = 'anonymous';
            document.head.appendChild(pre);
        }
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        if (link.dataset) link.dataset.themeFont = '1';
        link.href = 'https://fonts.googleapis.com/css2?family=' + (safe.gf || key.replace(/ /g, '+')) + '&display=swap';
        document.head.appendChild(link);
    }

    function applyTheme(t) {
        if (!t) t = {};
        var c = t.colors || {};
        var f = t.fonts || {};
        var a = t.animations || {};
        var root = document.documentElement;

        var colorMap = [
            ['brand', '--brand'], ['brandDark', '--brand-600'], ['brandLight', '--brand-400'],
            ['bg', '--ink'], ['bg2', '--ink-2'], ['surface', '--ink-3'],
            ['text', '--text'], ['muted', '--muted'], ['accent', '--halal'],
            ['paper', '--paper'], ['paperText', '--ink-text']
        ];
        colorMap.forEach(function (pair) {
            if (c[pair[0]]) root.style.setProperty(pair[1], c[pair[0]]);
        });
        if (c.brand) {
            var rgb = hexToRgb(c.brand);
            if (rgb) {
                root.style.setProperty('--brand-ghost', 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.12)');
                root.style.setProperty('--brand-glow', 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.35)');
            }
        }

        if (f.heading) {
            var hs = (FONT_SAFE[f.heading] && FONT_SAFE[f.heading].stack) || f.heading;
            root.style.setProperty('--font-display', hs);
            if (FONT_SAFE[f.heading]) injectFont(f.heading);
        }
        if (f.body) {
            var bs = (BODY_SAFE[f.body] && BODY_SAFE[f.body].stack) || f.body;
            root.style.setProperty('--font-body', bs);
            if (BODY_SAFE[f.body]) injectFont(f.body);
        }

        var motion = (a.reveal !== false);
        root.classList.toggle('animate-off', !motion);
        var marquee = (a.marquee !== false);
        root.classList.toggle('marquee-off', !marquee);
        root.classList.toggle('hover-off', a.hover === false);
    }

    document.addEventListener('DOMContentLoaded', function () {
        const $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
        const $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

        // ============================================================
        // CONTENIDO
        // ============================================================
        const DEFAULTS = window.LaMIF_CONTENT || {};
        let content = DEFAULTS;

        const ICONS = {
            glovo: '<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1.5 5.5h.01c2.4 0 4.1 1.1 4.1 3v9.1a.5.5 0 0 1-.5.5h-.02a.5.5 0 0 1-.5-.5v-4.2h-3.3v4.2a.5.5 0 0 1-.5.5h-.02a.5.5 0 0 1-.5-.5v-5.9c0-.9.6-1.5 1.5-1.5h2.83V8.4c0-1.2-.9-1.8-2.98-1.8-1.3 0-2.6.4-3.5 1.2a.5.5 0 0 1-.63-.03.5.5 0 0 1-.03-.7 5.3 5.3 0 0 1 4.6-1.57zm-3.5 7.1c.9 0 1.6.6 1.6 1.4v4.5a.5.5 0 0 1-.5.5h-.02a.5.5 0 0 1-.5-.5v-4.4h-3.08v4.4a.5.5 0 0 1-.5.5h-.02a.5.5 0 0 1-.5-.5v-5.4c0-.6.5-1.1 1.1-1.1h2.42z"/></svg>',
            ubereats: '<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>',
            telefono: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
            whatsapp: '<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>'
        };
        const FEATURE_ICONS = [
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 3h18v18H3zM12 8v8M8 12h8"/></svg>'
        ];
        const SOCIAL_ICONS = {
            instagram: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
            tiktok: '<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>',
            maps: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
            whatsapp: '<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>'
        };

        function orderHref(tipo) {
            const g = content.general;
            if (tipo === 'glovo') return g.glovo;
            if (tipo === 'ubereats') return g.ubereats;
            if (tipo === 'telefono') return 'tel:' + g.telefono;
            if (tipo === 'whatsapp') return g.whatsapp;
            return g.ubereats;
        }

        function formatPrice(v) {
            if (v === null || v === undefined || v === '') return null;
            const num = Number(v);
            return Number.isInteger(num) ? String(num) : String(num).replace('.', ',');
        }

        // ============================================================
        // RENDERIZADO POR SECCIÓN
        // ============================================================
        function setPictureSrc(imgEl, newSrc) {
            if (!imgEl || !newSrc) return;
            const src = String(newSrc);
            if (/^javascript:/i.test(src) || /^data:/i.test(src) || /^vbscript:/i.test(src)) return;
            imgEl.src = src;
            const pic = imgEl.closest('picture');
            if (pic) {
                const base = src.replace(/\.[^/.]+$/, '');
                const safeBase = base.indexOf('..') === -1 && base.indexOf('//') <= 0 ? base : src;
                const avif = pic.querySelector('source[type="image/avif"]');
                const webp = pic.querySelector('source[type="image/webp"]');
                if (avif) avif.srcset = safeBase + '.avif';
                if (webp) webp.srcset = safeBase + '.webp';
            }
        }

        function renderHero() {
            const h = content.hero || {};
            const dh = DEFAULTS.hero || {};
            const heroImg = $('#heroImage');
            if (heroImg) { setPictureSrc(heroImg, h.imagen || dh.imagen); if (h.imagenAlt) heroImg.alt = h.imagenAlt; }

            const title = $('#heroTitle');
            if (title) title.innerHTML = escapeHtml(h.titulo1 || dh.titulo1 || 'LA') + ' <em>' + escapeHtml(h.tituloEm || dh.tituloEm || 'MIF') + '</em>';

            const subtitle = $('#heroSubtitle');
            if (subtitle) subtitle.textContent = h.subtitulo || h.tagline || dh.subtitulo || dh.tagline || 'Sabores que conquistan';

            const kicker = $('#heroKicker');
            if (kicker) kicker.textContent = h.kicker || dh.kicker || '';

            const tagline = $('#heroTagline');
            if (tagline) tagline.textContent = h.tagline || dh.tagline || '';

            // nueva jerarquía: ctaPrimary = PEDIR AHORA, ctaSecondary = VER CARTA (compat con cta1/cta2)
            const cta1 = $('#heroCta1');
            if (cta1) {
                const src = h.ctaPrimary || h.cta2 || dh.ctaPrimary || dh.cta2;
                const t = $('.cta-text', cta1);
                if (t) t.textContent = (src && src.texto) || 'PEDIR AHORA';
                if (src && src.href) cta1.setAttribute('href', safeHref(src.href));
            }
            const cta2 = $('#heroCta2');
            if (cta2) {
                const src = h.ctaSecondary || h.cta1 || dh.ctaSecondary || dh.cta1;
                const t = $('.cta-text', cta2);
                if (t) t.textContent = (src && src.texto) || 'VER CARTA';
                if (src && src.href) cta2.setAttribute('href', safeHref(src.href));
            }

            // trust badges: usa h.trust si existe, fallback a h.badges
            const badges = $('#heroBadges');
            if (badges) {
                const items = (h.trust && h.trust.length ? h.trust : null) || (h.badges && h.badges.length ? h.badges : null) || (dh.trust || dh.badges || []);
                badges.innerHTML = items.map(function (b) {
                    const type = b.tipo === 'halal' ? 'halal' : 'brand';
                    const icon = type === 'halal'
                        ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
                        : '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
                    return '<span class="pill pill-' + type + '">' + icon + ' ' + escapeHtml(b.texto) + '</span>';
                }).join('');
            }

            const loc = $('#heroLocation');
            if (loc) loc.textContent = h.ubicacionHint || dh.ubicacionHint || '📍 Zaragoza — Casco Antiguo · C. de Marceliano Isábal, 5';

            const facts = $('#heroFacts');
            if (facts) {
                const datos = h.datos && h.datos.length ? h.datos : (dh.datos || []);
                facts.innerHTML = datos.map(function (d) {
                    return '<div class="hero-fact"><dt>' + escapeHtml(d.dt) + '</dt><dd>' + escapeHtml(d.dd) + '</dd></div>';
                }).join('');
            }
        }

        function renderVolcano() {
            const v = content.volcano || DEFAULTS.volcano || {};
            const s = function (id) { return $(id); };
            const ey = s('#volcanoEyebrow'); if (ey) ey.textContent = v.eyebrow || '';
            const ti = s('#volcanoTitle'); if (ti) ti.innerHTML = escapeHtml(v.titulo || 'ESPECIAL VOLCANO').replace('VOLCANO', '<em>VOLCANO</em>');
            const sub = s('#volcanoSubtitle'); if (sub) sub.textContent = v.subtitulo || '';
            const tx = s('#volcanoText'); if (tx) tx.textContent = v.texto || '';
            const meta = s('#volcanoMeta');
            if (meta) {
                const solo = v.precioSolo || '9';
                const menu = v.precioMenu || '11';
                meta.innerHTML = '<span class="volcano-price"><strong>' + escapeHtml(solo) + '€</strong> solo</span><span class="volcano-dot" aria-hidden="true">·</span><span class="volcano-price"><strong>' + escapeHtml(menu) + '€</strong> en menú</span><span class="volcano-seal">' + escapeHtml(v.sello || 'MADE IN FRESH') + '</span>';
            }
            const cta = s('#volcanoCta');
            if (cta) { const t = cta.textContent; if (v.cta && v.cta.texto) cta.firstChild.textContent = v.cta.texto + ' '; if (v.cta && v.cta.href) cta.setAttribute('href', safeHref(v.cta.href)); }
            const img = s('#volcanoImg');
            if (img) { setPictureSrc(img, v.imagen || (DEFAULTS.volcano && DEFAULTS.volcano.imagen) || 'assets/images/especial-volcano-burger-queso-halal-zaragoza.jpg'); if (v.imagenAlt) img.alt = v.imagenAlt; }
        }

        function renderBurgers() {
            const rail = $('#burgersRail');
            if (!rail) return;
            const cats = (content.menu && content.menu.categorias) || (DEFAULTS.menu && DEFAULTS.menu.categorias) || [];
            const burgers = cats.find(function (c) { return c.id === 'burgers'; });
            if (!burgers || !burgers.items) { rail.innerHTML = ''; return; }
            const featured = burgers.items.slice(0, 6);
            rail.innerHTML = featured.map(function (it) {
                const badge = it.badge ? '<span class="burger-rail-badge">' + escapeHtml(it.badge) + '</span>' : '';
                const solo = it.solo != null && it.solo !== '' ? formatPrice(it.solo) + '€' : '';
                const menu = it.menu != null && it.menu !== '' ? 'menú ' + formatPrice(it.menu) + '€' : '';
                const price = solo || menu || '';
                return '<div class="burger-rail-card">' +
                    '<div class="burger-rail-head"><span class="burger-rail-name">' + escapeHtml(it.nombre) + '</span>' + badge + '<span class="burger-rail-price">' + escapeHtml(price) + '</span></div>' +
                    '<p class="burger-rail-desc">' + escapeHtml(it.desc) + '</p>' +
                    (menu && solo ? '<p class="burger-rail-desc" style="color:var(--dim);font-size:0.78rem;margin-top:0.25rem">' + escapeHtml(menu) + '</p>' : '') +
                    '</div>';
            }).join('');
        }

        function renderTacos() {
            const list = $('#tacosList');
            const img = $('#tacosImg');
            if (img) {
                // imagen de tacos es estática en el HTML; no se sobrescribe
            }
            if (!list) return;
            const cats = (content.menu && content.menu.categorias) || (DEFAULTS.menu && DEFAULTS.menu.categorias) || [];
            const tacos = cats.find(function (c) { return c.id === 'tacos'; });
            if (!tacos || !tacos.items) { list.innerHTML = ''; return; }
            list.innerHTML = tacos.items.map(function (it) {
                const solo = it.solo != null && it.solo !== '' ? formatPrice(it.solo) + '€' : '';
                const menu = it.menu != null && it.menu !== '' ? formatPrice(it.menu) + '€' : '';
                const price = solo ? solo + (menu && solo !== menu ? ' · ' + menu : '') : menu;
                const badge = it.badge ? ' <span class="menu-badge" style="margin-left:0.4rem">' + escapeHtml(it.badge) + '</span>' : '';
                return '<li class="tacos-item"><div><span class="tacos-item-name">' + escapeHtml(it.nombre) + badge + '</span><br><span class="tacos-item-desc">' + escapeHtml(it.desc) + '</span></div><span class="tacos-item-price">' + escapeHtml(price) + '</span></li>';
            }).join('');
        }

        function renderSandwiches() {
            const list = $('#sandwichesList');
            if (!list) return;
            const cats = (content.menu && content.menu.categorias) || (DEFAULTS.menu && DEFAULTS.menu.categorias) || [];
            const cat = cats.find(function (c) { return c.id === 'sandwiches'; });
            if (!cat || !cat.items) { list.innerHTML = ''; return; }
            list.innerHTML = cat.items.slice(0,4).map(function (it) {
                const price = it.solo != null && it.solo !== '' ? formatPrice(it.solo) + '€' : (it.menu ? formatPrice(it.menu) + '€' : '');
                return '<li class="tacos-item"><div><span class="tacos-item-name">' + escapeHtml(it.nombre) + '</span><br><span class="tacos-item-desc">' + escapeHtml(it.desc) + '</span></div><span class="tacos-item-price">' + escapeHtml(price) + '</span></li>';
            }).join('');
        }

        function renderPostres() {
            const list = $('#postresList');
            if (!list) return;
            const cats = (content.menu && content.menu.categorias) || (DEFAULTS.menu && DEFAULTS.menu.categorias) || [];
            const cat = cats.find(function (c) { return c.id === 'extras'; });
            if (!cat || !cat.items) { list.innerHTML = ''; return; }
            list.innerHTML = cat.items.slice(0,4).map(function (it) {
                const price = it.solo != null && it.solo !== '' ? formatPrice(it.solo) + '€' : '';
                return '<li class="tacos-item"><div><span class="tacos-item-name">' + escapeHtml(it.nombre) + '</span><br><span class="tacos-item-desc">' + escapeHtml(it.desc) + '</span></div><span class="tacos-item-price">' + escapeHtml(price) + '</span></li>';
            }).join('');
        }

        function renderMarquee() {
            const track = $('#marqueeTrack');
            if (!track) return;
            const items = (content.marquee && content.marquee.items.length ? content.marquee.items : DEFAULTS.marquee.items) || [];
            const block = items.map(function (i) {
                return '<span>' + escapeHtml(i) + '</span><i>★</i>';
            }).join('');
            track.innerHTML = block + block;
        }

        function renderFeatured() {
            const e = content.especialidad || {};
            const s = function (id) { return $(id); };

            const ey = s('#espEyebrow'); if (ey) ey.textContent = e.eyebrow || '';
            const ti = s('#espTitulo'); if (ti) ti.innerHTML = escapeHtml(e.titulo1) + '<br><span class="text-brand">' + escapeHtml(e.tituloEnfasis) + '</span>';
            const tx = s('#espTexto'); if (tx) tx.textContent = e.texto || '';
            const li = s('#espLista'); if (li) li.innerHTML = (e.lista || []).map(function (x) {
                return '<li><span class="tick" aria-hidden="true"></span>' + escapeHtml(x) + '</li>';
            }).join('');

            const cta = s('#espCta');
            if (cta) {
                const t = $('.cta-text', cta); if (t) t.textContent = (e.cta && e.cta.texto) || 'Ver hamburguesas';
                if (e.cta && e.cta.href) cta.setAttribute('href', safeHref(e.cta.href));
            }

            const img = s('#espImg');
            if (img) { setPictureSrc(img, e.imagen || DEFAULTS.especialidad.imagen); img.alt = e.imagenAlt || ''; }

            const count = s('#espCount');
            if (count) count.innerHTML = escapeHtml(e.contadorNumero) + ' <small>' + sanitizeHtml(e.contadorTexto) + '</small>';
        }

        function renderNosotros() {
            const n = content.nosotros || {};
            const s = function (id) { return $(id); };

            const ey = s('#nosEyebrow'); if (ey) ey.textContent = n.eyebrow || '';
            const ti = s('#nosTitulo'); if (ti) ti.innerHTML = escapeHtml(n.titulo1) + '<br>' + escapeHtml(n.titulo2);

            const textos = s('#nosTextos');
            if (textos) textos.innerHTML = (n.textos || []).map(function (t) { return '<p class="about-text">' + sanitizeHtml(t) + '</p>'; }).join('');

            const fe = s('#nosFeatures');
            if (fe) fe.innerHTML = (n.features || []).map(function (f, i) {
                const icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
                return '<li class="feature-item">' + icon +
                    '<span><strong>' + escapeHtml(f.t) + '</strong><br>' + escapeHtml(f.d) + '</span></li>';
            }).join('');

            const img = s('#nosImg');
            if (img) { setPictureSrc(img, n.imagen || DEFAULTS.nosotros.imagen); img.alt = n.imagenAlt || ''; }

            const stats = s('#nosStats');
            if (stats) stats.innerHTML = (n.stats || []).map(function (st) {
                return '<div class="stat"><span class="stat-number" data-count="' + escapeHtml(st.n) + '">' + escapeHtml(st.n) + '</span><span class="stat-label">' + escapeHtml(st.label) + '</span></div>';
            }).join('');
        }

        function buildMenu() {
            const grid = $('#menuGrid');
            if (!grid) return [];
            const cats = (content.menu && content.menu.categorias) || [];
            const cards = [];
            cats.forEach(function (cat) {
                (cat.items || []).forEach(function (item) {
                    const card = document.createElement('div');
                    card.className = 'menu-card' + (cat.id === 'burgers' ? ' burger-card' : '');
                    card.dataset.category = cat.id;

                    const hasSolo = item.solo !== null && item.solo !== undefined && item.solo !== '';
                    const hasMenu = item.menu !== null && item.menu !== undefined && item.menu !== '';
                    let priceCell;
                    let menuLine = '';
                    if (hasSolo) {
                        priceCell = formatPrice(item.solo) + '€';
                        if (hasMenu) menuLine = 'menú ' + formatPrice(item.menu) + '€';
                    } else if (hasMenu) {
                        priceCell = formatPrice(item.menu) + '€';
                        menuLine = 'solo en menú';
                    } else {
                        priceCell = 'Consultar';
                    }

                    const badge = item.badge
                        ? '<span class="menu-badge' + (cat.id === 'burgers' ? ' on-dark' : '') + '">' + escapeHtml(item.badge) + '</span>'
                        : '';

                    card.innerHTML =
                        '<div class="menu-head">' +
                            '<h3 class="menu-name">' + escapeHtml(item.nombre) + '</h3>' +
                            badge +
                            '<span class="menu-dots" aria-hidden="true"></span>' +
                        '</div>' +
                        '<span class="menu-price">' + escapeHtml(priceCell) + '</span>' +
                        (menuLine ? '<span class="menu-menu-price">' + escapeHtml(menuLine) + '</span>' : '') +
                        '<p class="menu-desc">' + escapeHtml(item.desc) + '</p>';

                    grid.appendChild(card);
                    cards.push(card);
                });
            });
            return cards;
        }

        function renderMenu() {
            const m = content.menu || {};
            const s = function (id) { return $(id); };

            const ey = s('#menuEyebrow'); if (ey) ey.textContent = m.eyebrow || '';
            const ti = s('#menuTitulo'); if (ti) ti.innerHTML = escapeHtml(m.titulo1) + '<br>' + escapeHtml(m.titulo2);
            const intro = s('#menuIntro'); if (intro) intro.textContent = m.intro || '';
            const ctaP = s('#menuCtaTexto'); if (ctaP) ctaP.textContent = m.ctaTexto || '';

            const cats = (m.categorias) || [];

            const filter = $('#menuFilter');
            if (filter) {
                let html = '<button class="filter-btn active" data-filter="all" role="tab" aria-selected="true">Todos</button>';
                cats.forEach(function (cat) {
                    html += '<button class="filter-btn" data-filter="' + escapeHtml(cat.id) + '" role="tab" aria-selected="false">' +
                        escapeHtml(cat.label) + ' <span class="count-badge">' + (cat.items ? cat.items.length : 0) + '</span></button>';
                });
                filter.innerHTML = html;
            }

            const grid = $('#menuGrid');
            if (grid) grid.innerHTML = '';
            menuCards = buildMenu();

            const note = $('#menuNote');
            if (note) note.innerHTML = '';

            // Muestra (2 fotos con leyenda) — con AVIF/WebP
            const show = $('#menuShowcase');
            if (show) {
                show.innerHTML = (m.muestra || []).map(function (it) {
                    const base = (it.imagen || '').replace(/\.[^/.]+$/, '');
                    return '<figure class="showcase-item"><picture>' +
                        '<source srcset="' + escapeHtml(base + '.avif') + '" type="image/avif">' +
                        '<source srcset="' + escapeHtml(base + '.webp') + '" type="image/webp">' +
                        '<img src="' + escapeHtml(it.imagen) + '" alt="' + escapeHtml(it.imagenAlt) + '" width="1300" height="812" loading="lazy" decoding="async">' +
                        '</picture><figcaption><span>' + escapeHtml(it.t1) + '</span><strong>' + escapeHtml(it.t2) + '</strong></figcaption></figure>';
                }).join('');
            }
        }

        function renderReviews() {
            const r = content.resenas || {};
            const s = function (id) { return $(id); };

            const ey = s('#resEyebrow'); if (ey) ey.textContent = r.eyebrow || '';
            const sc = s('#resPuntuacion'); if (sc) sc.textContent = r.puntuacion || '5,0';
            const res = s('#resResumen'); if (res) res.innerHTML = sanitizeHtml(r.resumen || '');
            const go = s('#resGo');
            if (go) { if (r.goUrl) go.setAttribute('href', safeHref(r.goUrl)); const t = $('.cta-text', go); if (t) t.textContent = r.botonVer || 'Ver todas en Google'; }

            const grid = $('#reviewsGrid');
            if (!grid) return;
            const items = r.items || [];
            const gUrl = content.general.mapsUrl;
            grid.innerHTML = items.map(function (it) {
                const avatar = (it.nombre || '?').trim().charAt(0).toUpperCase();
                const stars = '<span class="review-stars" aria-hidden="true">★★★★★</span>';
                const head = '<div class="review-head">' +
                    '<span class="review-avatar">' + escapeHtml(avatar) + '</span>' +
                    '<span class="review-who"><strong>' + escapeHtml(it.nombre) + '</strong><small>' + escapeHtml(it.detalle || 'Google') + '</small></span>' +
                    stars + '</div>';
                const quote = '<blockquote>“' + escapeHtml(it.texto) + '”</blockquote>';
                const date = it.fecha ? '<span class="review-date">' + escapeHtml(it.fecha) + '</span>' : '';
                return '<a href="' + escapeHtml(safeHref(gUrl)) + '" target="_blank" rel="noopener" class="review-card' + (it.destacado ? ' featured' : '') + '">' + head + quote + date + '</a>';
            }).join('');
        }

        function renderPedido() {
            const p = content.pedido || {};
            const s = function (id) { return $(id); };

            const ey = s('#pedEyebrow'); if (ey) ey.textContent = p.eyebrow || '';
            const ti = s('#pedTitulo'); if (ti) ti.textContent = p.titulo || '';
            const tx = s('#pedTexto'); if (tx) tx.textContent = p.texto || '';

            const btns = $('#pedButtons');
            if (btns) {
                btns.innerHTML = (p.opciones || []).map(function (op) {
                    return '<a href="' + escapeHtml(safeHref(orderHref(op.tipo))) + '"' + (op.tipo !== 'telefono' ? ' target="_blank" rel="noopener"' : '') + ' class="btn btn-ink">' +
                        (ICONS[op.tipo] || '') + escapeHtml(op.etiqueta) + '</a>';
                }).join('');
            }

            const img = s('#pedImg');
            if (img) { setPictureSrc(img, p.imagen || DEFAULTS.pedido.imagen); img.alt = p.imagenAlt || ''; }
        }

        function renderUbicacion() {
            const u = content.ubicacion || {};
            const g = content.general || {};
            const s = function (id) { return $(id); };

            const ey = s('#ubiEyebrow'); if (ey) ey.textContent = u.eyebrow || '';
            const ti = s('#ubiTitulo'); if (ti) ti.innerHTML = escapeHtml(u.titulo1) + '<br>' + escapeHtml(u.titulo2);

            const addr = s('#ubiAddress');
            if (addr) addr.innerHTML = '<h3>' + escapeHtml(u.dirTitulo || 'Dirección') + '</h3><p>' + sanitizeHtml(u.dirTexto) + '</p>';

            const sched = s('#ubiSchedule');
            if (sched) {
                sched.innerHTML = '<h3>' + escapeHtml(u.horTitulo || 'Horario') + '</h3><div class="schedule">' +
                    (u.horario || []).map(function (row) {
                        return '<div class="schedule-row"><span>' + escapeHtml(row.dias) + '</span><span>' + escapeHtml(row.horas) + '</span></div>';
                    }).join('') + '</div>';
            }

            const contact = s('#ubiContact');
            if (contact) {
                contact.innerHTML = '<h3>' + escapeHtml(u.telTitulo || 'Contacto') + '</h3>' +
                    '<p><a href="tel:' + escapeHtml(g.telefono) + '">Llamar ahora</a> · <a href="' + escapeHtml(safeHref(g.whatsapp)) + '" target="_blank" rel="noopener">' + escapeHtml(g.whatsappLabel || 'WhatsApp') + '</a></p>';
            }

            const price = s('#ubiPrice');
            if (price) price.innerHTML = '<h3>' + escapeHtml(u.precioTitulo || 'Precio medio') + '</h3><p>' + escapeHtml(u.precioTexto) + '</p>';

            const cta = s('#openDirections'); if (cta) { const t = $('.cta-text', cta); if (t) t.textContent = u.ctaLlegar || 'Cómo llegar'; }

            const map = s('#ubiMap');
            if (map) {
                const embed = g.mapsEmbed;
                if (embed && /^https:\/\/(www\.)?google\.com\/maps\/embed/.test(embed)) {
                    if (!map.src || map.src === 'about:blank' || map.getAttribute('src') === '') {
                        map.setAttribute('data-src', embed);
                    } else if (!map.getAttribute('data-src')) {
                        map.setAttribute('data-src', embed);
                        map.removeAttribute('src');
                    }
                    if ('IntersectionObserver' in window) {
                        const io = new IntersectionObserver(function (entries) {
                            entries.forEach(function (e) {
                                if (e.isIntersecting) {
                                    if (!map.src || map.src === 'about:blank') map.src = map.getAttribute('data-src');
                                    io.unobserve(map);
                                }
                            });
                        }, { rootMargin: '400px 0px' });
                        io.observe(map);
                        // fallback: si el usuario hace hover/click en el área, carga inmediata
                        map.addEventListener('mouseenter', function once() {
                            if (!map.src || map.src === 'about:blank') map.src = map.getAttribute('data-src');
                            map.removeEventListener('mouseenter', once);
                        }, { once: true });
                    } else {
                        map.src = embed;
                    }
                }
            }

            const dirAddr = s('#dirAddress');
            if (dirAddr) dirAddr.textContent = u.direccionModal || (g.addressLine1 + ' · ' + g.addressLine2);

            $$('.dir-option').forEach(function (a) {
                if (a.dataset.app === 'google' && g.mapsUrl) a.setAttribute('href', safeHref(g.mapsUrl));
                if (a.dataset.app === 'apple' && g.mapsAppleUrl) a.setAttribute('href', safeHref(g.mapsAppleUrl));
                if (a.dataset.app === 'waze' && g.wazeUrl) a.setAttribute('href', safeHref(g.wazeUrl));
            });
        }

        function renderFooter() {
            const f = content.footer || {};
            const g = content.general || {};

            const tag = $('#footTagline'); if (tag) tag.textContent = f.tagline || '';

            const social = $('#footSocial');
            if (social) {
                const links = [
                    { icon: 'instagram', href: g.instagram, label: 'Instagram de La Mif' },
                    { icon: 'tiktok', href: g.tiktok, label: 'TikTok de La Mif' },
                    { icon: 'maps', href: g.mapsUrl, label: 'La Mif en Google Maps' },
                    { icon: 'whatsapp', href: g.whatsapp, label: 'WhatsApp de La Mif' }
                ];
                social.innerHTML = links.map(function (l) {
                    return '<a href="' + escapeHtml(safeHref(l.href)) + '" target="_blank" rel="noopener" aria-label="' + escapeHtml(l.label) + '">' + SOCIAL_ICONS[l.icon] + '</a>';
                }).join('');
            }

            const cred = $('#footCredits');
            if (cred) cred.innerHTML = escapeHtml((f.creditos || '').replace('%año%', new Date().getFullYear()));
        }

        function renderSEO() {
            const seo = content.seo || {};
            const g = content.general || {};
            const origin = location.origin;

            if (seo.titulo) document.title = seo.titulo;
            if (seo.descripcion) {
                const md = $('meta[name="description"]'); if (md) md.setAttribute('content', seo.descripcion);
                const og = $('meta[property="og:description"]'); if (og) og.setAttribute('content', seo.descripcion);
                const tw = $('meta[name="twitter:description"]'); if (tw) tw.setAttribute('content', seo.descripcion);
            }
            if (seo.titulo) {
                const ogt = $('meta[property="og:title"]'); if (ogt) ogt.setAttribute('content', seo.titulo);
                const twt = $('meta[name="twitter:title"]'); if (twt) twt.setAttribute('content', seo.titulo);
            }
            if (seo.ogImage) {
                const img = seo.ogImage.indexOf('http') === 0 ? seo.ogImage : origin + '/' + seo.ogImage.replace(/^\.?\//, '');
                const ogi = $('meta[property="og:image"]'); if (ogi) ogi.setAttribute('content', img);
                const twi = $('meta[name="twitter:image"]'); if (twi) twi.setAttribute('content', img);
            }

            // JSON-LD Restaurant actualizado
            const schemaEl = $('#schemaJsonLd');
            if (schemaEl) {
                const hours = (content.horarioEsquema || []).map(function (h) {
                    return { '@type': 'OpeningHoursSpecification', dayOfWeek: h.dias, opens: h.opens, closes: h.closes };
                });
                const schema = {
                    '@context': 'https://schema.org',
                    '@type': 'Restaurant',
                    name: g.nombre,
                    image: (seo.ogImage || '').indexOf('http') === 0 ? seo.ogImage : origin + '/' + (seo.ogImage || 'assets/images/portada-la-mif-halal-zaragoza.jpg').replace(/^\.?\//, ''),
                    url: origin + '/',
                    telephone: g.telefono,
                    priceRange: g.precioDesde + '€–' + g.precioHasta + '€',
                    servesCuisine: ['Halal', 'Fast Food', 'French', 'Hamburguesas', 'Tacos franceses', 'Sandwiches'],
                    hasMenu: origin + '/#carta',
                    acceptsReservations: 'False',
                    address: {
                        '@type': 'PostalAddress',
                        streetAddress: g.addressLine1,
                        addressLocality: 'Zaragoza',
                        postalCode: '50004',
                        addressRegion: 'Aragón',
                        addressCountry: 'ES'
                    },
                    geo: { '@type': 'GeoCoordinates', latitude: 41.6488, longitude: -0.8808 },
                    aggregateRating: { '@type': 'AggregateRating', ratingValue: (g.rating || '5,0').replace(',', '.'), reviewCount: String(g.reseñas || '50').replace(/[^0-9]/g, '') },
                    openingHoursSpecification: hours,
                    sameAs: [g.instagram, g.tiktok, g.mapsUrl],
                    potentialAction: {
                        '@type': 'OrderAction',
                        target: [g.glovo, g.ubereats, g.whatsapp].filter(Boolean),
                        deliveryMethod: 'http://purl.org/goodrelations/v1#DeliveryModeParcelService'
                    }
                };
                schemaEl.textContent = JSON.stringify(schema);
            }
        }

        function updateLinks() {
            const g = content.general || {};

            // Teléfono
            $$('a[href^="tel:"]').forEach(function (a) { a.setAttribute('href', 'tel:' + String(g.telefono || '').replace(/[^0-9+]/g, '')); });

            // WhatsApp
            $$('a[href^="https://wa.me/"]').forEach(function (a) { a.setAttribute('href', safeHref(g.whatsapp)); });

            // Glovo / Uber Eats en footer
            const glovoEl = $('#footGlovo'); if (glovoEl) glovoEl.setAttribute('href', safeHref(g.glovo));
            const uberEl = $('#footUber'); if (uberEl) uberEl.setAttribute('href', safeHref(g.ubereats));
        }

        function setupAnalytics() {
            function track(label) {
                if (typeof window.gtag === 'function') {
                    window.gtag('event', 'conversion_click_' + label, { event_category: 'conversion', event_label: label });
                }
            }
            document.addEventListener('click', function (e) {
                const a = e.target.closest ? e.target.closest('a[href]') : null;
                if (!a) return;
                const href = a.getAttribute('href') || '';
                if (href.indexOf('glovo') !== -1) track('glovo');
                else if (href.indexOf('ubereats') !== -1) track('ubereats');
                else if (href.indexOf('wa.me') !== -1) track('whatsapp');
                else if (href.indexOf('tel:') === 0) track('llamar');
                else if (href.indexOf('maps.app.goo.gl') !== -1) track('maps');
            }, { passive: true });
        }

        let menuCards = [];
        let activeFilter = 'all';

        function applyFilter(filter) {
            activeFilter = filter;
            const cards = $$('.menu-card', $('#menuGrid'));
            cards.forEach(function (card) {
                card.classList.toggle('hidden', !(filter === 'all' || card.dataset.category === filter));
            });
        }

        function updateNote(filter) {
            const note = $('#menuNote');
            if (!note) return;
            if (filter === 'all') {
                note.innerHTML = escapeHtml((content.menu && content.menu.notaGeneral) || DEFAULTS.menu.notaGeneral || '');
                return;
            }
            const cat = (content.menu.categorias || []).find(function (c) { return c.id === filter; });
            if (!cat) return;
            let html = escapeHtml(cat.nota);
            if (cat.complementos) html += ' <strong>' + escapeHtml(cat.complementos) + '</strong>';
            note.innerHTML = html;
        }

        function renderAll() {
            renderHero();
            renderMarquee();
            renderVolcano();
            renderFeatured();
            renderBurgers();
            renderTacos();
            renderSandwiches();
            renderPostres();
            renderNosotros();
            renderMenu();
            renderReviews();
            renderPedido();
            renderUbicacion();
            renderFooter();
            renderSEO();
            updateLinks();
            applyFilter(activeFilter);
            updateNote(activeFilter);
            setupReveal();
            setupCounters();
        }

        // ============================================================
        // ANIMACIONES (reveal + contadores)
        // ============================================================
        let revealObserver = null;
        function setupReveal() {
            if (!('IntersectionObserver' in window)) return;
            if (!revealObserver) revealObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
                });
            }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

            const targets = $$(
                '.section-head, .featured-copy, .featured-media, .volcano-copy, .volcano-media, .about-copy, .about-media, .about-stats, ' +
                '.showcase-item, .reviews-summary, .review-card, .order-panel, .location-card, .location-map, .menu-card, .burger-rail-card, .tacos-copy, .tacos-media'
            );
            targets.forEach(function (el, i) {
                if (el.classList.contains('menu-card') || el.classList.contains('review-card') || el.classList.contains('location-card')) {
                    el.style.transitionDelay = ((i % 6) * 0.05) + 's';
                }
                el.classList.add('reveal');
                el.classList.remove('is-visible');
                if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-visible');
                else revealObserver.observe(el);
            });
        }

        let counterObserver = null;
        function animateCounter(el) {
            const text = el.textContent;
            const target = parseFloat(text.replace(/[^0-9.]/g, ''));
            if (isNaN(target)) return;
            const suffix = text.replace(/[0-9.]/g, '');
            const isFloat = text.includes('.');
            const duration = 1200;
            const start = Date.now();
            function frame() {
                const p = Math.min((Date.now() - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                const value = isFloat ? (target * eased).toFixed(1) : String(Math.round(target * eased));
                el.textContent = value + suffix;
                if (p < 1 && !reduceMotion) requestAnimationFrame(frame);
                else el.textContent = text;
            }
            requestAnimationFrame(frame);
        }
        function setupCounters() {
            const numbers = $$('#nosStats .stat-number');
            if (!numbers.length) return;
            if (!('IntersectionObserver' in window)) {
                numbers.forEach(function (n) { n.textContent = n.dataset.count || n.textContent; });
                return;
            }
            if (!counterObserver) {
                counterObserver = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) { animateCounter(entry.target); counterObserver.unobserve(entry.target); }
                    });
                }, { threshold: 0.6 });
            }
            numbers.forEach(function (s) {
                const final = s.dataset.count || s.textContent;
                s.textContent = final;
                counterObserver.observe(s);
            });
        }

        // ============================================================
        // NAVEGACIÓN / UI (se conecta una vez)
        // ============================================================
        const preloader = $('#preloader');
        setTimeout(function () { preloader.classList.add('hidden'); }, 800);

        const navLinks = $$('.nav-link');
        function updateActiveNav() {
            const sections = $$('main section[id]');
            let current = '';
            sections.forEach(function (s) { if (window.scrollY >= s.offsetTop - 160) current = s.id; });
            navLinks.forEach(function (link) {
                link.classList.toggle('active', link.getAttribute('href') === '#' + current);
            });
        }

        const header = $('#siteHeader');
        const backToTop = $('#backToTop');
        const heroParallaxImg = $('#heroImage');
        function onScroll() {
            const y = window.scrollY;
            header.classList.toggle('scrolled', y > 40);
            backToTop.classList.toggle('visible', y > 600);
            updateActiveNav();
            if (heroParallaxImg && !reduceMotion && y < window.innerHeight * 1.1) {
                heroParallaxImg.style.transform = 'translateY(' + (y * 0.14) + 'px)';
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });

        // Menú móvil
        const hamburger = $('#hamburger');
        const navList = $('#navList');
        function closeMenu() {
            hamburger.classList.remove('active');
            navList.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
        hamburger.addEventListener('click', function () {
            const open = navList.classList.toggle('active');
            hamburger.classList.toggle('active', open);
            hamburger.setAttribute('aria-expanded', String(open));
            document.body.style.overflow = open ? 'hidden' : '';
        });
        document.addEventListener('click', function (e) {
            if (navList.classList.contains('active') && !navList.contains(e.target) && !hamburger.contains(e.target)) closeMenu();
        });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

        // Smooth scroll (delegado: funciona con enlaces re-renderizados)
        document.addEventListener('click', function (e) {
            const anchor = e.target.closest ? e.target.closest('a[href^="#"]') : null;
            if (!anchor) return;
            const target = $(anchor.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            closeMenu();
            target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        });

        // Filtros de la carta (delegado) — solo en carta.html
        const menuFilterEl = $('#menuFilter');
        if (menuFilterEl) {
            menuFilterEl.addEventListener('click', function (e) {
                const btn = e.target.closest ? e.target.closest('.filter-btn') : null;
                if (!btn) return;
                $$('.filter-btn', this).forEach(function (b) {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                applyFilter(btn.dataset.filter);
                updateNote(btn.dataset.filter);
            });
        }

        // Tiles de categorías Goiko → filtran la carta si existe #carta, si no navegan a carta.html
        $$('.cat-tile[data-filter]').forEach(function (tile) {
            tile.addEventListener('click', function (e) {
                const menuOnPage = !!$('#menuFilter') && !!$('#menuGrid');
                if (menuOnPage) {
                    e.preventDefault();
                    const f = tile.dataset.filter;
                    const mf = $('#menuFilter');
                    const btn = mf ? $('.filter-btn[data-filter="' + f + '"]', mf) : null;
                    if (btn && mf) {
                        $$('.filter-btn', mf).forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
                        btn.classList.add('active'); btn.setAttribute('aria-selected','true');
                    }
                    applyFilter(f);
                    updateNote(f);
                    const carta = $('#carta');
                    if (carta) carta.scrollIntoView({ behavior: reduceMotion ? 'auto':'smooth', block:'start' });
                }
                // si no hay carta en esta página, deja que el href="carta.html" navegue
            });
        });

        // Modal cómo llegar
        const openDirections = $('#openDirections');
        const overlay = $('#directionsOverlay');
        const closeDirections = $('#directionsClose');
        if (openDirections && overlay) {
            function openModal() {
                overlay.classList.add('open');
                overlay.setAttribute('aria-hidden', 'false');
                closeDirections.focus();
                document.body.style.overflow = 'hidden';
            }
            function closeModal() {
                overlay.classList.remove('open');
                overlay.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
                openDirections.focus();
            }
            openDirections.addEventListener('click', openModal);
            closeDirections.addEventListener('click', closeModal);
            overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
            });
        }

        // Año actual (refuerzo)
        if (content.footer && content.footer.creditos) renderFooter();

        // ============================================================
        // CARGA DEL CONTENIDO REMOTO (panel de administración)
        // ============================================================
        function fetchRemote() {
            if (location.protocol === 'file:') { applyTheme(content.tema); renderAll(); return; }

            var GITHUB_RAW = 'https://raw.githubusercontent.com/AYOUBALILM/WEB-LAMIF-ZARAGOZA/main/data/content.json';
            var urls = ['/api/content', GITHUB_RAW];
            var idx = 0;

            function attempt() {
                if (idx >= urls.length) return;
                var u = urls[idx++];
                var ctrl = new AbortController();
                var timer = setTimeout(function () { ctrl.abort(); }, 4000);
                fetch(u, { headers: { 'Accept': 'application/json' }, signal: ctrl.signal })
                    .then(function (r) { clearTimeout(timer); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
                    .then(function (data) {
                        if (data && data.general) { content = data; applyTheme(content.tema); renderAll(); }
                        else { attempt(); }
                    })
                    .catch(function () { clearTimeout(timer); attempt(); });
            }
            attempt();
        }

        // Render inmediato con los datos locales + actualización remota
        applyTheme(content.tema);
        renderAll();
        fetchRemote();
    });
})();
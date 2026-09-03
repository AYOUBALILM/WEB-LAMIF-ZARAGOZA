// ========================================
// LA MIF — Panel de administración
// Edita textos, precios, imágenes y estructura
// y publica al instante vía /api/content.
// ========================================

(function () {
    'use strict';

// Sin contraseña de acceso. La clave ADMIN_KEY protege el guardado
    // y debe coincidir con LAMIF_ADMIN_TOKEN en Netlify.
    var ADMIN_KEY = 'lamif2026';
    var API_URL = '/api/content';
    var SESSION_KEY = 'lmif_admin';

    var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
    var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

    var DEFAULT_CONTENT = window.LaMIF_CONTENT || {};
    var content = null;

    // ---------------------------------------------------------------
    // HELPERS
    // ---------------------------------------------------------------
    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function getPath(obj, path) {
        return String(path || '').split('.').reduce(function (o, k) {
            return (o == null || o[k] === undefined) ? undefined : o[k];
        }, obj);
    }
    function setPath(obj, path, value) {
        var keys = String(path).split('.');
        var o = obj;
        for (var i = 0; i < keys.length - 1; i++) {
            if (o[keys[i]] == null) o[keys[i]] = {};
            o = o[keys[i]];
        }
        o[keys[keys.length - 1]] = value;
    }

    // ---------------------------------------------------------------
    // ESQUEMA DE SECCIONES Y CAMPOS
    // ---------------------------------------------------------------
    function IMG(key, path, label) { return { img: key, path: path, label: label }; }

    var TABS = [
        {
            id: 'general', label: 'General',
            hint: 'Datos básicos del restaurante que se usan en toda la web.',
            fields: [
                { label: 'Nombre del restaurante', path: 'general.nombre', type: 'text' },
                { label: 'Lema (debajo del logo)', path: 'general.lema', type: 'text' },
                { label: 'Eslogan', path: 'general.eslogan', type: 'text' },
                { label: 'Teléfono — para llamadas (con código, ej: +34671238456)', path: 'general.telefono', type: 'tel' },
                { label: 'Teléfono — tal y como se muestra', path: 'general.telefonoDisplay', type: 'text' },
                { label: 'Etiqueta de WhatsApp', path: 'general.whatsappLabel', type: 'text' },
                { label: 'Dirección — línea 1', path: 'general.addressLine1', type: 'text' },
                { label: 'Dirección — línea 2', path: 'general.addressLine2', type: 'text' },
                { label: 'Precio medio — desde (€)', path: 'general.precioDesde', type: 'text' },
                { label: 'Precio medio — hasta (€)', path: 'general.precioHasta', type: 'text' },
                { label: 'Valoración en Google (ej: 5,0)', path: 'general.rating', type: 'text' },
                { label: 'Número de reseñas', path: 'general.reseñas', type: 'text' },
                { label: 'Porcentaje halal', path: 'general.halalPct', type: 'text' }
            ]
        },
        {
            id: 'enlaces', label: 'Enlaces y redes',
            hint: 'Tus enlaces reales: cada botón de la web se actualiza solo al guardar.',
            fields: [
                { label: 'WhatsApp (URL completa)', path: 'general.whatsapp', type: 'url' },
                { label: 'Instagram', path: 'general.instagram', type: 'url' },
                { label: 'TikTok', path: 'general.tiktok', type: 'url' },
                { label: 'Glovo', path: 'general.glovo', type: 'url' },
                { label: 'Uber Eats', path: 'general.ubereats', type: 'url' },
                { label: 'Google Maps — cómo llegar', path: 'general.mapsUrl', type: 'url' },
                { label: 'Apple Maps — cómo llegar', path: 'general.mapsAppleUrl', type: 'url' },
                { label: 'Waze — cómo llegar', path: 'general.wazeUrl', type: 'url' },
                { label: 'Google Maps embebido (enlace completo del iframe)', path: 'general.mapsEmbed', type: 'textarea', hint: 'Pégalo completo, incluyendo https://www.google.com/maps/embed?…' },
                { label: 'URL de tus reseñas de Google (botón “Ver todas”)', path: 'resenas.goUrl', type: 'textarea' }
            ]
        },
        {
            id: 'seo', label: 'SEO',
            hint: 'Lo que ven Google y las redes sociales al compartir la web.',
            fields: [
                { label: 'Título de la pestaña del navegador', path: 'seo.titulo', type: 'text' },
                { label: 'Descripción para buscadores', path: 'seo.descripcion', type: 'textarea' },
                IMG('og', 'seo.ogImage', 'Imagen para compartir en redes')
            ]
        },
        {
            id: 'portada', label: 'Portada (inicio)',
            hint: 'La imagen de fondo y todos los textos del inicio. La nueva jerarquía usa subtítulo + trust.',
            fields: [
                IMG('hero', 'hero.imagen', 'Imagen de fondo del inicio'),
                { label: 'Texto alternativo de la portada', path: 'hero.imagenAlt', type: 'text' },
                { label: 'Título — palabra 1', path: 'hero.titulo1', type: 'text' },
                { label: 'Título — palabra 2 (resaltada)', path: 'hero.tituloEm', type: 'text' },
                { label: 'Subtítulo — Sabores que conquistan', path: 'hero.subtitulo', type: 'text' },
                { label: 'Lema bajo el subtítulo', path: 'hero.kicker', type: 'text' },
                { label: 'Frase antigua (compatibilidad)', path: 'hero.tagline', type: 'text' },
                { label: 'Botón Pedir — texto', path: 'hero.ctaPrimary.texto', type: 'text' },
                { label: 'Botón Pedir — destino', path: 'hero.ctaPrimary.href', type: 'text' },
                { label: 'Botón Ver carta — texto', path: 'hero.ctaSecondary.texto', type: 'text' },
                { label: 'Botón Ver carta — destino', path: 'hero.ctaSecondary.href', type: 'text' },
                { label: 'Píldora 1 — ★ en Google', path: 'hero.trust.0.texto', type: 'text' },
                { label: 'Píldora 2 — Halal', path: 'hero.trust.1.texto', type: 'text' },
                { label: 'Pista de ubicación bajo las píldoras', path: 'hero.ubicacionHint', type: 'text' }
            ],
            lists: [
                { path: 'hero.datos', label: 'Datos rápidos del hero (legacy)', addLabel: 'Añadir dato',
                  fields: [{ key: 'dt', label: 'Título' }, { key: 'dd', label: 'Detalle' }] },
                { path: 'marquee.items', label: 'Palabras de la cinta (una por línea)', addLabel: 'Añadir palabra',
                  scalar: true, fields: [{ key: '', label: 'Palabra' }] }
            ]
        },
        {
            id: 'volcano', label: 'Producto estrella',
            hint: 'El Volcano — la burger que todos vienen a probar. Se muestra justo después del hero.',
            fields: [
                IMG('volcano', 'volcano.imagen', 'Foto del Volcano'),
                { label: 'Texto alternativo', path: 'volcano.imagenAlt', type: 'text' },
                { label: 'Eyebrow', path: 'volcano.eyebrow', type: 'text' },
                { label: 'Título', path: 'volcano.titulo', type: 'text' },
                { label: 'Subtítulo — Cuando el queso...', path: 'volcano.subtitulo', type: 'text' },
                { label: 'Descripción', path: 'volcano.texto', type: 'textarea' },
                { label: 'Precio solo (€)', path: 'volcano.precioSolo', type: 'text' },
                { label: 'Precio menú (€)', path: 'volcano.precioMenu', type: 'text' },
                { label: 'Sello', path: 'volcano.sello', type: 'text' },
                { label: 'Botón — texto', path: 'volcano.cta.texto', type: 'text' },
                { label: 'Botón — destino', path: 'volcano.cta.href', type: 'text' }
            ]
        },
        {
            id: 'especialidad', label: 'Especialidad',
            hint: 'La gran sección de la casa (campaña).',
            fields: [
                IMG('esp', 'especialidad.imagen', 'Foto de la especialidad'),
                { label: 'Texto alternativo de la imagen', path: 'especialidad.imagenAlt', type: 'text' },
                { label: 'Etiqueta superior', path: 'especialidad.eyebrow', type: 'text' },
                { label: 'Título — parte 1', path: 'especialidad.titulo1', type: 'text' },
                { label: 'Título — parte resaltada', path: 'especialidad.tituloEnfasis', type: 'text' },
                { label: 'Texto de la sección', path: 'especialidad.texto', type: 'textarea' },
                { label: 'Botón — texto', path: 'especialidad.cta.texto', type: 'text' },
                { label: 'Botón — destino (#carta)', path: 'especialidad.cta.href', type: 'text' },
                { label: 'Número del contador grande', path: 'especialidad.contadorNumero', type: 'text' },
                { label: 'Etiqueta del contador (se permite <br>)', path: 'especialidad.contadorTexto', type: 'text' }
            ],
            lists: [
                { path: 'especialidad.lista', label: 'Lista de beneficios', addLabel: 'Añadir beneficio',
                  scalar: true, fields: [{ key: '', label: 'Beneficio' }] }
            ]
        },
        {
            id: 'nosotros', label: 'Nosotros',
            hint: 'La historia y las ventajas.',
            fields: [
                IMG('nos', 'nosotros.imagen', 'Foto de Nosotros'),
                { label: 'Texto alternativo de la imagen', path: 'nosotros.imagenAlt', type: 'text' },
                { label: 'Etiqueta superior', path: 'nosotros.eyebrow', type: 'text' },
                { label: 'Título — parte 1', path: 'nosotros.titulo1', type: 'text' },
                { label: 'Título — parte 2', path: 'nosotros.titulo2', type: 'text' }
            ],
            lists: [
                { path: 'nosotros.textos', label: 'Párrafos (se permiten <strong>…</strong>)', addLabel: 'Añadir párrafo',
                  fields: [{ key: '', label: 'Párrafo', type: 'textarea' }] },
                { path: 'nosotros.features', label: 'Ventajas (se muestran con iconos)', addLabel: 'Añadir ventaja',
                  fields: [{ key: 't', label: 'Título' }, { key: 'd', label: 'Descripción' }] },
                { path: 'nosotros.stats', label: 'Números destacados', addLabel: 'Añadir número',
                  fields: [{ key: 'n', label: 'Número (ej: 50+)' }, { key: 'label', label: 'Etiqueta' }] }
            ]
        },
        {
            id: 'carta', label: 'Carta',
            hint: 'Textos de la carta y su estructura completa. Los precios se muestran como “solo” y como “menú”.',
            fields: [
                { label: 'Etiqueta superior', path: 'menu.eyebrow', type: 'text' },
                { label: 'Título — parte 1', path: 'menu.titulo1', type: 'text' },
                { label: 'Título — parte 2', path: 'menu.titulo2', type: 'text' },
                { label: 'Introducción', path: 'menu.intro', type: 'textarea' },
                { label: 'Nota general (cuando se ve “Todos”)', path: 'menu.notaGeneral', type: 'textarea' },
                { label: 'Texto del pie de carta', path: 'menu.ctaTexto', type: 'text' },
                IMG('m1', 'menu.muestra.0.imagen', 'Foto muestra 1'),
                { label: 'Texto alternativo muestra 1', path: 'menu.muestra.0.imagenAlt', type: 'text' },
                { label: 'Muestra 1 — línea 1', path: 'menu.muestra.0.t1', type: 'text' },
                { label: 'Muestra 1 — línea 2', path: 'menu.muestra.0.t2', type: 'text' },
                IMG('m2', 'menu.muestra.1.imagen', 'Foto muestra 2'),
                { label: 'Texto alternativo muestra 2', path: 'menu.muestra.1.imagenAlt', type: 'text' },
                { label: 'Muestra 2 — línea 1', path: 'menu.muestra.1.t1', type: 'text' },
                { label: 'Muestra 2 — línea 2', path: 'menu.muestra.1.t2', type: 'text' }
            ]
        },
        {
            id: 'resenas', label: 'Reseñas',
            hint: 'Las opiniones que ves en la web.',
            fields: [
                { label: 'Etiqueta superior', path: 'resenas.eyebrow', type: 'text' },
                { label: 'Puntuación grande (ej: 5,0)', path: 'resenas.puntuacion', type: 'text' },
                { label: 'Texto de resumen', path: 'resenas.resumen', type: 'textarea' },
                { label: 'Botón — texto', path: 'resenas.botonVer', type: 'text' }
            ],
            lists: [
                { path: 'resenas.items', label: 'Opiniones', addLabel: 'Añadir opinión',
                  itemTitle: 'nombre',
                  fields: [
                      { key: 'nombre', label: 'Nombre' },
                      { key: 'detalle', label: 'Detalle (Ej: Cena · 10-20 €)' },
                      { key: 'fecha', label: 'Cuándo se publicó (Ej: Hace 3 semanas)' },
                      { key: 'destacado', label: 'Destacar esta opinión', type: 'checkbox' },
                      { key: 'texto', label: 'Texto de la opinión', type: 'textarea' }
                  ] }
            ]
        },
        {
            id: 'pedido', label: 'Pedido',
            hint: 'La sección donde se pide comida.',
            fields: [
                IMG('ped', 'pedido.imagen', 'Foto del pedido'),
                { label: 'Texto alternativo de la imagen', path: 'pedido.imagenAlt', type: 'text' },
                { label: 'Etiqueta superior', path: 'pedido.eyebrow', type: 'text' },
                { label: 'Título', path: 'pedido.titulo', type: 'text' },
                { label: 'Texto', path: 'pedido.texto', type: 'textarea' }
            ],
            lists: [
                { path: 'pedido.opciones', label: 'Botones de pedido', addLabel: 'Añadir botón',
                  itemTitle: 'etiqueta',
                  fields: [
                      { key: 'etiqueta', label: 'Etiqueta (Glovo, Uber Eats…)' },
                      { key: 'tipo', label: 'Plataforma', type: 'select', options: [
                          { v: 'glovo', t: 'Glovo' }, { v: 'ubereats', t: 'Uber Eats' },
                          { v: 'telefono', t: 'Llamar (teléfono)' }, { v: 'whatsapp', t: 'WhatsApp' } ] }
                  ] }
            ]
        },
        {
            id: 'ubicacion', label: 'Ubicación',
            hint: 'Dirección, horarios y contacto.',
            fields: [
                { label: 'Etiqueta superior', path: 'ubicacion.eyebrow', type: 'text' },
                { label: 'Título — parte 1', path: 'ubicacion.titulo1', type: 'text' },
                { label: 'Título — parte 2', path: 'ubicacion.titulo2', type: 'text' },
                { label: 'Botón “Cómo llegar”', path: 'ubicacion.ctaLlegar', type: 'text' },
                { label: 'Dirección — título de tarjeta', path: 'ubicacion.dirTitulo', type: 'text' },
                { label: 'Dirección — texto (se permite <br>)', path: 'ubicacion.dirTexto', type: 'textarea' },
                { label: 'Horario — título', path: 'ubicacion.horTitulo', type: 'text' },
                { label: 'Contacto — título', path: 'ubicacion.telTitulo', type: 'text' },
                { label: 'Precio — título', path: 'ubicacion.precioTitulo', type: 'text' },
                { label: 'Precio — texto', path: 'ubicacion.precioTexto', type: 'text' },
                { label: 'Texto del modal “Cómo llegar”', path: 'ubicacion.direccionModal', type: 'text' }
            ],
            lists: [
                { path: 'ubicacion.horario', label: 'Filas del horario', addLabel: 'Añadir fila',
                  fields: [{ key: 'dias', label: 'Días' }, { key: 'horas', label: 'Horas' }] }
            ]
        },
        {
            id: 'footer', label: 'Pie de página',
            hint: 'Textos del final de la web.',
            fields: [
                { label: 'Frase del pie', path: 'footer.tagline', type: 'textarea' },
                { label: 'Créditos (usa %año% para el año automático)', path: 'footer.creditos', type: 'text' }
            ]
        }
    ];
    TABS.forEach(function (t) { t.lists = t.lists || []; });

    function imgDefForKey(key) {
        for (var t = 0; t < TABS.length; t++) {
            for (var f = 0; f < TABS[t].fields.length; f++) {
                if (TABS[t].fields[f].img === key) return TABS[t].fields[f];
            }
        }
        return null;
    }

    // ---------------------------------------------------------------
    // UI BÁSICA
    // ---------------------------------------------------------------
    var toastTimer = null;
    function toast(msg, type) {
        var el = $('#toast');
        el.textContent = msg;
        el.className = 'toast show ' + (type || '');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { el.className = 'toast'; }, 3600);
    }
    function markDirty() {
        $('#saveStatus').textContent = 'Hay cambios sin guardar';
        $('#saveStatus').classList.add('dirty');
    }
    function markSaved() {
        $('#saveStatus').textContent = 'Todos los cambios publicados';
        $('#saveStatus').classList.remove('dirty');
    }

    // ---------------------------------------------------------------
    // INICIO Y LOGIN
    // ---------------------------------------------------------------
    function init() {
        $('#logoutBtn').addEventListener('click', function () {
            location.reload();
        });
        enterApp();
    }

    function enterApp() {
        boot();
    }

    function boot() {
        loadContent().then(function (data) {
            if (data && data.general) {
                content = data;
                // preserva claves nuevas (volcano, etc.) si el blob es antiguo
                for (var k in DEFAULT_CONTENT) {
                    if (DEFAULT_CONTENT.hasOwnProperty(k) && content[k] == null) {
                        content[k] = JSON.parse(JSON.stringify(DEFAULT_CONTENT[k]));
                    }
                }
                // hero trust compatibilidad
                if (content.hero && !content.hero.trust && content.hero.badges) content.hero.trust = content.hero.badges;
                if (content.hero && !content.hero.subtitulo && content.hero.tagline) content.hero.subtitulo = content.hero.tagline;
            } else {
                content = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
            }
            bindTabNav();
            renderTabs();
            bindGlobalActions();
            bindBodyEvents();
            markSaved();
            toast('Contenido cargado. Edita y pulsa “Guardar cambios”.');
        });
    }

    function loadContent() {
        return fetch(API_URL, { headers: { 'Accept': 'application/json' } })
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function (data) { return data || null; })
            .catch(function () { return null; });
    }

    // ---------------------------------------------------------------
    // PESTAÑAS
    // ---------------------------------------------------------------
    function renderTabs() {
        var nav = $('#tabNav');
        nav.innerHTML = TABS.map(function (t, i) {
            return '<button type="button" class="tab-btn' + (i === 0 ? ' active' : '') + '" data-tab="' + t.id + '">' + esc(t.label) + '</button>';
        }).join('');
        showTab(TABS[0].id);
    }

    function bindTabNav() {
        $('#tabNav').addEventListener('click', function (e) {
            var btn = e.target.closest('.tab-btn');
            if (!btn) return;
            $$('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            showTab(btn.dataset.tab);
        });
    }

    function showTab(id) {
        var tab = TABS.filter(function (t) { return t.id === id; })[0];
        if (!tab) return;
        var body = $('#tabBody');
        var html = '<div class="tab-head"><h2>' + esc(tab.label) + '</h2><p>' + esc(tab.hint) + '</p></div>';
        tab.fields.forEach(function (f) { html += f.img ? imgFieldHTML(f) : fieldHTML(f); });
        tab.lists.forEach(function (def) { html += listEditorHTML(def); });
        if (id === 'carta') html += menuEditorHTML();
        body.innerHTML = html;

        populateTab(tab);
    }

    function fieldHTML(f) {
        var isTextarea = f.type === 'textarea';
        var attrs = ' data-path="' + esc(f.path) + '"' + (f.hint ? ' title="' + esc(f.hint) + '"' : '');
        var tagOpen = isTextarea ? '<textarea' + attrs + '>' : '<input type="' + (f.type === 'number' ? 'text' : f.type) + '"' + attrs + '/>';
        var tagClose = isTextarea ? '</textarea>' : '';
        return '<div class="field"><label>' + esc(f.label) + '</label>' + tagOpen + tagClose +
            (f.hint ? '<div class="hint">' + esc(f.hint) + '</div>' : '') + '</div>';
    }

    function imgFieldHTML(f) {
        return '<div class="field">' +
            '<label>' + esc(f.label) + '</label>' +
            '<div class="img-field">' +
            '<img class="img-preview" data-preview="' + f.img + '" alt="">' +
            '<div class="img-controls">' +
            '<input type="text" data-imgpath="' + f.img + '" placeholder="Ruta o URL de la imagen">' +
            '<div class="img-path">' +
            '<button type="button" data-imgfile="' + f.img + '">Subir imagen desde tu equipo…</button> · ' +
            '<button type="button" data-imgreset="' + f.img + '">Volver al original</button>' +
            '<input type="file" data-imginput="' + f.img + '" accept="image/*" hidden>' +
            '</div>' +
            '<span class="hint">JPG/PNG (máx ~2 MB recomendado). Se guarda junto al contenido. También puedes pegar una ruta existente, p. ej. <code>assets/images/mi-foto.jpg</code>.</span>' +
            '</div></div></div>';
    }

    function populateTab(tab) {
        tab.fields.forEach(function (f) {
            if (f.img) { refreshImage(f); return; }
            var v = getPath(content, f.path);
            var el = $('[data-path="' + f.path + '"]');
            if (!el) return;
            el.value = (v == null ? '' : v);
        });
        tab.lists.forEach(function (def) {
            var el = $('.list-editor[data-listpath="' + def.path + '"]');
            if (el) renderList(el, def);
        });
        if (tab.id === 'carta') renderMenuEditor();
    }

    // ---------------------------------------------------------------
    // LISTAS GENÉRICAS
    // ---------------------------------------------------------------
    function listEditorHTML(def) {
        return '<div class="list-editor" data-listpath="' + esc(def.path) + '">' +
            '<h3>' + esc(def.label) +
            ' <button type="button" class="btn btn-secondary" data-listadd>' + esc(def.addLabel) + '</button></h3>' +
            '<div class="list-rows"></div></div>';
    }

    function renderList(el, def) {
        var rows = getPath(content, def.path) || [];
        var box = $('.list-rows', el);
        box.innerHTML = rows.map(function (row, i) {
            var title = '';
            if (def.itemTitle) title = row ? (row[def.itemTitle] || '') : '';
            if (!title) title = def.scalar ? String(row == null ? '' : row) : 'Elemento ' + (i + 1);
            var fields = def.fields.map(function (fd) {
                var value = def.scalar ? (row == null ? '' : row) : (row ? row[fd.key] : '');
                if (fd.type === 'checkbox') {
                    return '<span class="check-row"><label><input type="checkbox" data-field="' + esc(fd.key) + '"' + (value ? ' checked' : '') + '> ' + esc(fd.label) + '</label></span>';
                }
                if (fd.type === 'select') {
                    var opts = (fd.options || []).map(function (o) {
                        return '<option value="' + esc(o.v) + '"' + (value === o.v ? ' selected' : '') + '>' + esc(o.t) + '</option>';
                    }).join('');
                    return '<select data-field="' + esc(fd.key) + '">' + opts + '</select>';
                }
                return '<textarea data-field="' + esc(fd.key) + '" rows="' + (fd.type === 'textarea' ? '3' : '1') + '" placeholder="' + esc(fd.label) + '">' + esc(value) + '</textarea>';
            }).join('');
            return '<div class="list-item" data-row="' + i + '">' +
                '<div class="list-item-head"><span class="item-title">' + esc(title) + '</span>' +
                '<span class="row-actions">' +
                '<button type="button" data-reorder="-1" title="Subir">↑</button>' +
                '<button type="button" data-reorder="1" title="Bajar">↓</button>' +
                '<button type="button" class="del" data-del title="Borrar">✕</button>' +
                '</span></div>' +
                '<div class="field-grid">' + fields + '</div></div>';
        }).join('');
    }

    function gatherList(el, def) {
        var rows = [];
        $$('.list-item', el).forEach(function (item) {
            var row = {};
            $$('[data-field]', item).forEach(function (inp) {
                if (inp.type === 'checkbox') row[inp.dataset.field] = inp.checked;
                else row[inp.dataset.field] = inp.value;
            });
            if (def.scalar) row = row[''] || '';
            rows.push(row);
        });
        setPath(content, def.path, rows);
        return rows;
    }

    function listClickHandler(e) {
        var t = e.target;
        if (!t.closest) return;
        if (!t.closest('.list-editor')) return;
        var el = t.closest('.list-editor');
        var def = findListDef(el.dataset.listpath);
        if (!def) return;
        var row = t.closest('.list-item');
        var acted = false;
        if (t.dataset.listadd !== undefined && t.dataset.listadd !== false) {
            var rows = gatherList(el, def);
            rows.push(def.scalar ? '' : {});
            setPath(content, def.path, rows);
            renderList(el, def);
            acted = true;
        } else if (row && t.dataset.del !== undefined) {
            var r0 = gatherList(el, def);
            var idx = parseInt(row.dataset.row, 10);
            r0.splice(idx, 1);
            setPath(content, def.path, r0);
            renderList(el, def);
            acted = true;
        } else if (row && t.dataset.reorder) {
            var r1 = gatherList(el, def);
            var i1 = parseInt(row.dataset.row, 10);
            var j = i1 + parseInt(t.dataset.reorder, 10);
            if (j >= 0 && j < r1.length) {
                var tmp = r1[i1]; r1[i1] = r1[j]; r1[j] = tmp;
                setPath(content, def.path, r1);
                renderList(el, def);
                acted = true;
            }
        }
        if (acted) { markDirty(); e.preventDefault(); }
    }

    function findListDef(path) {
        for (var t = 0; t < TABS.length; t++) {
            for (var l = 0; l < TABS[t].lists.length; l++) {
                if (TABS[t].lists[l].path === path) return TABS[t].lists[l];
            }
        }
        return null;
    }

    // ---------------------------------------------------------------
    // EDITOR DE LA CARTA (categorías + productos)
    // ---------------------------------------------------------------
    function menuEditorHTML() {
        return '<div class="list-editor" id="menuEditor">' +
            '<h3>Categorías y productos</h3>' +
            '<p class="hint" style="margin-bottom:.8rem">Añade, borra o reordena productos y categorías con ↑ ↓ ✕. Deja vacío “Precio solo” o “Precio menú” si no se aplica.</p>' +
            '<div id="menuCats"></div>' +
            '<button type="button" class="btn btn-secondary" data-cat-add>+ Añadir categoría</button>' +
            '</div>';
    }

    function emptyCat() { return { id: '', label: 'Nueva categoría', nota: '', complementos: '', items: [] }; }
    function emptyItem() { return { nombre: '', desc: '', solo: null, menu: null, badge: '' }; }

    function renderMenuEditor() {
        var wrap = $('#menuCats');
        if (!wrap) return;
        var cats = content.menu.categorias || [];
        wrap.innerHTML = cats.map(function (cat, ci) {
            var items = cat.items || [];
            var itemHTML = items.map(function (it, ii) {
                var head = it.nombre || ('Producto ' + (ii + 1));
                return '<div class="list-item" data-item="' + ci + ':' + ii + '">' +
                    '<div class="list-item-head"><span class="item-title">' + esc(head) + '</span>' +
                    '<span class="row-actions">' +
                    '<button type="button" data-item-act="u">↑</button>' +
                    '<button type="button" data-item-act="d">↓</button>' +
                    '<button type="button" class="del" data-item-act="del">✕</button>' +
                    '</span></div><div class="field-grid">' +
                    '<input data-item-f="n" value="' + esc(it.nombre) + '" placeholder="Nombre del producto">' +
                    '<textarea data-item-f="d" rows="2" placeholder="Descripción">' + esc(it.desc) + '</textarea>' +
                    '<div class="field-row">' +
                    '<input data-item-f="a" value="' + esc(it.solo == null ? '' : it.solo) + '" placeholder="Precio solo (€)">' +
                    '<input data-item-f="m" value="' + esc(it.menu == null ? '' : it.menu) + '" placeholder="Precio menú (€)">' +
                    '</div>' +
                    '<input data-item-f="b" value="' + esc(it.badge) + '" placeholder="Etiqueta (Nueva, Popular… — opcional)">' +
                    '</div></div>';
            }).join('');

            return '<div class="cat-editor" data-cat="' + ci + '">' +
                '<div class="cat-editor-head">' +
                '<div style="min-width:0"><strong>' + esc(cat.label) + '</strong> ' +
                '<span class="hint">' + esc(cat.id) + ' · ' + items.length + ' producto' + (items.length === 1 ? '' : 's') + '</span></div>' +
                '<span class="row-actions">' +
                '<button type="button" data-cat-act="u">↑</button>' +
                '<button type="button" data-cat-act="d">↓</button>' +
                '<button type="button" class="del" data-cat-act="del">✕</button>' +
                '</span></div>' +
                '<div class="cat-editor-body">' +
                '<div class="field-grid">' +
                '<input data-cat-f="label" value="' + esc(cat.label) + '" placeholder="Nombre de la categoría (Hamburguesas…)">' +
                '<input data-cat-f="id" value="' + esc(cat.id) + '" placeholder="Código interno (burgers…)" title="Código usado por los filtros de la web">' +
                '<textarea data-cat-f="nota" rows="2" placeholder="Nota de la categoría">' + esc(cat.nota) + '</textarea>' +
                '<textarea data-cat-f="complementos" rows="1" placeholder="Complementos/extras (opcional)">' + esc(cat.complementos) + '</textarea>' +
                '</div>' +
                '<div class="list-editor" style="margin-top:1rem">' +
                '<h3>Productos <button type="button" class="btn btn-secondary" data-item-add="' + ci + '">+ Añadir producto</button></h3>' +
                '<div class="list-rows">' + itemHTML + '</div>' +
                '</div></div></div>';
        }).join('');
    }

    function gatherMenu() {
        var cats = [];
        $$('.cat-editor', $('#menuCats')).forEach(function (catEl, ci) {
            var cat = {
                id: $('[data-cat-f="id"]', catEl).value.trim(),
                label: $('[data-cat-f="label"]', catEl).value.trim() || ('Categoría ' + (ci + 1)),
                nota: $('[data-cat-f="nota"]', catEl).value,
                complementos: $('[data-cat-f="complementos"]', catEl).value,
                items: []
            };
            $$('[data-item]', catEl).forEach(function (itemEl) {
                var num = function (v) { return (v === '' || v == null) ? null : Number(v.replace(',', '.')); };
                cat.items.push({
                    nombre: $('[data-item-f="n"]', itemEl).value.trim(),
                    desc: $('[data-item-f="d"]', itemEl).value.trim(),
                    solo: num($('[data-item-f="a"]', itemEl).value),
                    menu: num($('[data-item-f="m"]', itemEl).value),
                    badge: $('[data-item-f="b"]', itemEl).value.trim()
                });
            });
            cats.push(cat);
        });
        content.menu.categorias = cats;
        return cats;
    }

    function menuClickHandler(e) {
        var t = e.target;
        if (!t.closest || $('#menuEditor') == null) return;
        if (!t.closest('#menuEditor')) return;

        var cats = gatherMenu();

        var catBtn = t.closest('[data-cat-act]');
        var addBtn = t.closest('[data-cat-add]');
        var itemAdd = t.closest('[data-item-add]');
        var itemBtn = t.closest('[data-item-act]');

        if (catBtn) {
            var ci = parseInt(catBtn.closest('.cat-editor').dataset.cat, 10);
            var act = catBtn.dataset.catAct;
            if (act === 'del') cats.splice(ci, 1);
            else if (act === 'u') move(cats, ci, -1);
            else if (act === 'd') move(cats, ci, 1);
        } else if (addBtn) {
            cats.push(emptyCat());
        } else if (itemAdd) {
            var catIdx = parseInt(itemAdd.dataset.itemAdd, 10);
            (cats[catIdx] ? cats[catIdx].items : (cats[catIdx] = emptyCat(), cats[catIdx].items)).push(emptyItem());
        } else if (itemBtn) {
            var parts = itemBtn.closest('[data-item]').dataset.item.split(':');
            var ci2 = parseInt(parts[0], 10), ii = parseInt(parts[1], 10);
            var ia = itemBtn.dataset.itemAct;
            var its = cats[ci2] ? cats[ci2].items : [];
            if (ia === 'del') its.splice(ii, 1);
            else if (ia === 'u') move(its, ii, -1);
            else if (ia === 'd') move(its, ii, 1);
        } else {
            return;
        }

        content.menu.categorias = cats;
        renderMenuEditor();
        markDirty();
        e.preventDefault();
    }

    function move(arr, i, d) {
        var j = i + d;
        if (j < 0 || j >= arr.length) return;
        var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }

    // ---------------------------------------------------------------
    // IMÁGENES
    // ---------------------------------------------------------------
    function compressImage(file, done) {
        if (!window.FileReader || !window.Image) { var r0 = new FileReader(); r0.onload = function () { done(r0.result); }; return r0.readAsDataURL(file); }
        var reader = new FileReader();
        reader.onload = function () {
            var img = new Image();
            img.onload = function () {
                var MAX = 1680;
                var w = img.width, h = img.height;
                var scale = 1;
                if (w > MAX || h > MAX) { scale = Math.min(MAX / w, MAX / h); w = Math.round(w * scale); h = Math.round(h * scale); }
                var canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                try {
                    var quality = 0.82;
                    var out = canvas.toDataURL('image/jpeg', quality);
                    if (out.length > 1500000) { out = canvas.toDataURL('image/jpeg', 0.7); }
                    done(out);
                } catch (e) { done(reader.result); }
            };
            img.onerror = function () { done(reader.result); };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    }

    function refreshImage(f) {
        var v = getPath(content, f.path) || '';
        var preview = $('[data-preview="' + f.img + '"]');
        var input = $('[data-imgpath="' + f.img + '"]');
        if (preview) preview.src = v || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="92"/>';
        if (input) input.value = (v && v.length > 96) ? '(imagen subida)' : v;
    }
    function defaultFor(path) { return getPath(DEFAULT_CONTENT, path) || ''; }
    function imgPathForKey(key) {
        var def = imgDefForKey(key);
        return def ? def.path : null;
    }

    function bodyEvents() {
        var body = $('#tabBody');
        if (!body) return;

        body.addEventListener('click', function (e) {
            var t = e.target;
            if (!t || !t.closest) return;
            listClickHandler(e);
            if (e.defaultPrevented) return;
            var fileBtn = t.closest('[data-imgfile]');
            if (fileBtn) {
                $('[data-imginput="' + fileBtn.dataset.imgfile + '"]').click();
                return;
            }
            var resetBtn = t.closest('[data-imgreset]');
            if (resetBtn) {
                var path = imgPathForKey(resetBtn.dataset.imgreset);
                if (path) { setPath(content, path, defaultFor(path)); refreshImage(imgDefForKey(resetBtn.dataset.imgreset) || {}); markDirty(); }
                return;
            }
            if (e.isTrusted) menuClickHandler(e);
        });

        body.addEventListener('change', function (e) {
            var t = e.target;
            if (t && t.dataset && t.dataset.imginput !== undefined) {
                var file = t.files && t.files[0];
                if (file) {
                    var def = imgDefForKey(t.dataset.imginput);
                    if (!def) return;
                    if (file.size > 4 * 1024 * 1024) { toast('La imagen pesa demasiado. Usa una menor de ~2 MB.', 'err'); return; }
                    compressImage(file, function (result) {
                        setPath(content, def.path, result);
                        refreshImage(def);
                        markDirty();
                        toast('Imagen añadida (optimizada). Recuerda pulsar “Guardar cambios”.');
                    });
                }
            }
            markDirty();
        });

        body.addEventListener('input', function (e) {
            var t = e.target;
            if (t && t.dataset && t.dataset.imgpath !== undefined) {
                var def = imgDefForKey(t.dataset.imgpath);
                if (def) {
                    setPath(content, def.path, t.value);
                    var preview = $('[data-preview="' + def.img + '"]');
                    if (preview) preview.src = t.value || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="92"/>';
                }
            }
            markDirty();
        });
    }

    function bindBodyEvents() {
        bodyEvents();
    }

    // ---------------------------------------------------------------
    // GUARDAR / COPIAS / RESTABLECER
    // ---------------------------------------------------------------
    function gatherFields() {
        $$('#tabBody [data-path]').forEach(function (el) {
            var v = el.value;
            if (getPath(content, el.dataset.path) != null) setPath(content, el.dataset.path, v);
        });
        // Listas con cambios pendientes (textos tecleados, sin pulsar nada)
        $$('#tabBody .list-editor').forEach(function (el) {
            var def = findListDef(el.dataset.listpath);
            if (def && !def.skipGather) gatherList(el, def);
        });
    }

    function saveContent() {
        gatherFields();
        if ($('#menuEditor')) gatherMenu();
        var btn = $('#btnSave');
        btn.disabled = true;
        fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
            body: JSON.stringify(content)
        }).then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        }).then(function () {
            markSaved();
            toast('¡Publicado! La web ya muestra los cambios.', 'ok');
        }).catch(function (err) {
            toast('Error al guardar: ' + err.message + '. Revisa tu conexión.', 'err');
        }).finally(function () { btn.disabled = false; });
    }

    function downloadBackup() {
        var blob = new Blob([JSON.stringify(gatherDirty() || content, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'lamif-contenido.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast('Copia de seguridad descargada.', 'ok');
    }
    function gatherDirty() { gatherFields(); return content; }

    function restoreBackup(file) {
        var reader = new FileReader();
        reader.onload = function () {
            try {
                var data = JSON.parse(reader.result);
                if (!data.general) throw new Error('El archivo no es una copia válida.');
                content = data;
                var tab = $('.tab-btn.active');
                renderTabs();
                if (tab) showTab(tab.dataset.tab);
                markDirty();
                toast('Copia cargada. Revisa y pulsa “Guardar cambios”.', 'ok');
            } catch (err) {
                toast('No se pudo leer el archivo: ' + err.message, 'err');
            }
        };
        reader.readAsText(file);
    }

    function bindGlobalActions() {
        $('#btnSave').addEventListener('click', saveContent);
        $('#btnBackup').addEventListener('click', downloadBackup);
        $('#btnRestore').addEventListener('click', function () { $('#restoreFile').click(); });
        $('#restoreFile').addEventListener('change', function () {
            if (this.files && this.files[0]) restoreBackup(this.files[0]);
        });
        $('#btnReset').addEventListener('click', function () {
            if (confirm('¿Restablecer TODO el contenido a los valores originales? Esta acción borra los cambios actuales.')) {
                content = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
                var tabBtn = $('.tab-btn.active');
                renderTabs();
                if (tabBtn) showTab(tabBtn.dataset.tab);
                markDirty();
                toast('Contenido restablecido. Pulsa “Guardar cambios” para publicarlo.', 'ok');
            }
        });
    }

    init();
})();
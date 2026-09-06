// ========================================
// LA MIF - Contenido editable (fuente única)
// El panel de administración (admin.html) lee y
// guarda estos datos en el blob de Netlify.
// ========================================

window.LaMIF_CONTENT = {
    version: 1,

    general: {
        nombre: 'La Mif',
        lema: 'Burgers · Tacos franceses · Sandwiches',
        eslogan: 'Restaurante halal en el corazón de Zaragoza',
        telefono: '+34671238456',
        telefonoDisplay: '+34 671 23 84 56',
        whatsapp: 'https://wa.me/34671238456',
        whatsappLabel: 'WhatsApp',
        instagram: 'https://www.instagram.com/la_mif_barca',
        tiktok: 'https://www.tiktok.com/@lamifbarca',
        ubereats: 'https://www.ubereats.com/es/store/lamif/bZj4UCxXREijnpVIEXkyRA?diningMode=DELIVERY&surfaceName=',
        glovo: 'https://kaspi.glovoapp.com/es/es/zaragoza/stores/la-mif-zar',
        mapsUrl: 'https://maps.app.goo.gl/LBhanTJts5r28ktu8?g_st=ic',
        mapsAppleUrl: 'https://maps.apple.com/?ll=41.6488,-0.8808&q=La%20Mif',
        wazeUrl: 'https://waze.com/ul?ll=41.6488,-0.8808&navigate=yes',
        mapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3031.6!2d-0.8808!3d41.6488!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd5914cc0f43e04d%3A0x4a8123c189f9c4c0!2sLa+Mif!5e0!3m2!1ses!2ses!4v1234567890',
        addressLine1: 'C. de Marceliano Isábal, 5',
        addressLine2: 'Casco Antiguo, 50004 Zaragoza',
        precioDesde: '1',
        precioHasta: '20',
        rating: '5,0',
        reseñas: '50',
        halalPct: '100'
    },

    seo: {
        titulo: 'La MIF Zaragoza | Hamburguesas, Tacos Franceses y Comida Halal',
        descripcion: 'La Mif Zaragoza — Casco Antiguo. Hamburguesas, tacos franceses, sandwiches y platos caseros 100% halal, hechos al momento. 5,0★ en Google. Pide por Glovo, Uber Eats o WhatsApp y recógelo en C. de Marceliano Isábal, 5.',
        ogImage: 'assets/images/portada-la-mif-halal-zaragoza.jpg'
    },

    hero: {
        imagen: 'assets/images/portada-la-mif-halal-zaragoza.jpg',
        imagenAlt: 'Portada de La Mif Zaragoza — hamburguesas, tacos franceses y platos caseros 100% halal en el Casco Antiguo',
        titulo1: 'LA',
        tituloEm: 'MIF',
        subtitulo: 'Sabores que conquistan',
        kicker: 'Restaurante Halal · Burgers · Tacos franceses · Sandwiches',
        // compatibilidad: cta1/cta2 antiguos se mantienen para el panel
        cta1: { texto: 'Ver carta', href: '#carta' },
        cta2: { texto: 'Pedir ahora', href: '#pedido' },
        ctaPrimary: { texto: 'PEDIR AHORA', href: '#pedido' },
        ctaSecondary: { texto: 'VER CARTA', href: '#carta' },
        trust: [
            { tipo: 'brand', texto: '★★★★★ 5,0 en Google' },
            { tipo: 'halal', texto: '100% HALAL' }
        ],
        ubicacionHint: '📍 Zaragoza — Casco Antiguo · C. de Marceliano Isábal, 5',
        // legacy — se oculta visualmente pero se conserva para no romper el panel
        badges: [
            { tipo: 'brand', texto: '5.0★ en Google · 50 reseñas' },
            { tipo: 'halal', texto: '100% Halal' }
        ],
        datos: [
            { dt: 'Horario', dd: 'Todos los días desde las 12:00' },
            { dt: 'Precio medio', dd: '1 – 20 € por persona' },
            { dt: 'Ubicación', dd: 'C. Marceliano Isábal, 5 · Casco Antiguo' }
        ]
    },

    volcano: {
        eyebrow: 'EL QUE TODOS VIENEN A PROBAR',
        titulo: 'ESPECIAL VOLCANO',
        subtitulo: 'Cuando el queso se convierte en lava.',
        texto: 'Nuestra burger más icónica: 100g de carne fresca, cheddar fundido y salsa al gusto. Jugosa, contundente y 100% halal. La que repiten todos.',
        precioSolo: '9',
        precioMenu: '11',
        cta: { texto: 'QUIERO PROBARLO', href: '#pedido' },
        imagen: 'assets/images/especial-volcano-burger-queso-halal-zaragoza.jpg',
        imagenAlt: 'Especial Volcano de La Mif — burger con queso fundido, 100% halal, Zaragoza',
        sello: 'MADE IN FRESH'
    },

    marquee: {
        items: ['La Mif', '100% Halal', 'Burgers', 'Tacos franceses', 'Sandwiches', 'Hecho al momento', 'Zaragoza']
    },

    especialidad: {
        eyebrow: 'La especialidad de la casa',
        titulo1: 'La casa de las',
        tituloEnfasis: 'hamburguesas',
        texto: 'En La Mif las hamburguesas son las protagonistas: carne fresca, pan artesanal y queso fundido. Deléitate con nuestra selección de burgers caseras, todas 100% halal.',
        lista: [
            'Más de 15 hamburguesas en carta',
            'Carne fresca y al momento',
            'Precio solo o en menú'
        ],
        cta: { texto: 'Ver hamburguesas', href: '#carta' },
        imagen: 'assets/images/burgers-caseras-halal-zaragoza.jpg',
        imagenAlt: 'Hamburguesa casera halal de La Mif con queso fundido — Casco Antiguo Zaragoza',
        contadorNumero: '15',
        contadorTexto: 'burgers<br>en carta'
    },

    nosotros: {
        eyebrow: 'Hecho para que vuelvas',
        titulo1: 'Comida que habla',
        titulo2: 'por sí sola.',
        textos: [
            'Street-food premium 100% halal en el Casco Antiguo de Zaragoza. Ingredientes frescos, preparado al momento. Tacos franceses crujientes, burgers jugosas y platos caseros hechos para que repitas.'
        ],
        imagen: 'assets/images/sandwiches-seccion-halal-zaragoza.jpg',
        imagenAlt: 'Sandwiches y tacos halal al momento de La Mif — Casco Antiguo Zaragoza',
        stats: [
            { n: '50+', label: 'Reseñas en Google' },
            { n: '5.0', label: 'Valoración media' },
            { n: '100%', label: 'Halal' }
        ],
        features: [
            { t: '100% Halal', d: 'Normativa halal estricta en cada ingrediente y proceso' },
            { t: 'Siempre fresco', d: 'Lo preparamos al momento, con producto fresco del día' },
            { t: 'Para llevar', d: 'Pide para llevar o a domicilio — Glovo, Uber Eats o WhatsApp' },
            { t: 'Calle Isábal, 5', d: 'En el corazón del Casco Antiguo de Zaragoza' }
        ]
    },

    menu: {
        eyebrow: 'Nuestra carta · Made in Fresh',
        titulo1: 'Descubre nuestros',
        titulo2: 'sabores',
        intro: 'Tacos o bowls, sandwiches y platos caseros. Todos preparados con ingredientes frescos y de la más alta calidad.',
        notaGeneral: 'Precio solo | en menú (patatas fritas + bebida). Elegir cualquier categoría para ver los detalles.',
        ctaTexto: '¿Te ha entrado el antojo? Pide ahora y te lo llevamos.',
        categorias: (window.LaMIF_MENU || []).map(function (c) {
            return {
                id: c.cat,
                label: c.label,
                nota: c.note || '',
                complementos: c.supplements || '',
                items: (c.items || []).map(function (i) {
                    return { nombre: i.n, desc: i.d, solo: i.a, menu: i.m, badge: i.b || '' };
                })
            };
        }),
        muestra: [
            {
                imagen: 'assets/images/sandwiches-seccion-halal-zaragoza.jpg',
                imagenAlt: 'Sandwiches y tacos halal hechos al momento en La Mif — Casco Antiguo',
                t1: 'Sandwiches & Tacos',
                t2: 'Hechos al momento'
            },
            {
                imagen: 'assets/images/platos-combinados-halal-zaragoza.jpg',
                imagenAlt: 'Platos caseros halal con patatas, arroz y salsa de champiñón — La Mif Zaragoza',
                t1: 'Platos caseros',
                t2: 'Patatas, arroz y salsa champiñón'
            }
        ]
    },

    resenas: {
        eyebrow: 'Lo que dicen nuestros clientes',
        puntuacion: '5,0',
        resumen: 'Más de <strong>50 reseñas</strong> con la mejor valoración en Google.',
        botonVer: 'Ver todas en Google',
        goUrl: 'https://www.google.com/maps/place/La+Mif/@41.6488,-0.8808,17z/data=!4m8!3m7!1s0xd5914cc0f43e04d:0x4a8123c189f9c4c0!8m2!3d41.6488!4d-0.8808!9m1!1b1!16s%2Fg%2F11tf23k4r7',
        items: [
            { nombre: 'Jhoana RS', detalle: 'Local Guide · 79 reseñas', fecha: 'Hace 3 semanas', destacado: false, texto: 'Pasamos por el sitio, que es relativamente nuevo, y decidimos probar los tacos franceses. La verdad es que nos sorprendió bastante: nos dejamos guiar por la chica que nos atendió (muy amable) y el resultado fue espectacular. ¡Las salsas muy muy buenas! Sin duda volveremos.' },
            { nombre: 'Rim El Harrouch', detalle: 'Cena · 10-20 €', fecha: 'Hace 3 semanas', destacado: true, texto: '¡Experiencia increíble en La MIF! La comida estaba buenísima, muy bien presentada y con muy buena cantidad. Todo estaba delicioso y se nota el cuidado que ponen en cada plato. La camarera súper amable y el local muy bonito y cuidado. ¡Todo de 10!' },
            { nombre: 'Amina Amina', detalle: 'Cena · 20-30 €', fecha: 'Hace 3 semanas', destacado: false, texto: 'He comido döner y platos similares por toda Europa y siempre me han parecido pasables. Pero lo que probamos aquí no fue solo rico, fue delicioso. Todo estaba jugoso, incluso las patatas fritas. Y la chica que nos atendió: qué encanto. Lo recomiendo totalmente.' },
            { nombre: 'Susana López Ortiz', detalle: 'Local Guide · 433 reseñas', fecha: 'Hace 1 mes', destacado: false, texto: 'Lo descubrimos por casualidad y nos encantó... tacos franceses muy caseros y a buen precio. La atención fue espectacular. Los chic@s encantadores, muy atentos en todo momento. Volveremos a probar más cosas ya que tienen una carta amplia.' },
            { nombre: 'Dalila El Maayouf', detalle: '10-20 €', fecha: 'Hace 2 días', destacado: false, texto: 'Excelente lugar para disfrutar de unos buenos tacos y hamburguesas. Todo se nota fresco, bien preparado y con mucho sabor. Las hamburguesas son jugosas y las porciones son generosas. La atención es de diez. ¡Muy recomendable!' },
            { nombre: 'Safaa Ouahabi', detalle: 'Google', fecha: 'Hace 1 mes', destacado: false, texto: '¡Una experiencia excelente! La comida está buenísima, especialmente los tacos y las hamburguesas. La carne es muy fresca y de gran calidad. La atención al cliente es de 10, el personal es muy amable y hace que te sientas como en casa. ¡Tenéis que probarlo!' },
            { nombre: 'Thijs Kerstens', detalle: 'Google', fecha: 'Hace 1 mes', destacado: false, texto: 'Un lugar realmente excepcional. La comida estaba deliciosa y el personal muy amable. La relación calidad-precio es excelente. Sin duda, lo recomiendo encarecidamente si estás en Zaragoza.' },
            { nombre: 'Asahaad Moussa', detalle: 'Google', fecha: 'Hace 5 días', destacado: false, texto: 'Es más que excelente. Llevo más de 14 años en el sector de la restauración y es uno de los mejores restaurantes de comida rápida en los que he comido. Mis hijos...' }
        ]
    },

    pedido: {
        eyebrow: '¿YA TE HA ENTRADO HAMBRE?',
        titulo: 'PIDE AHORA',
        texto: 'Pide ahora. Lo preparamos al momento.',
        opciones: [
            { etiqueta: 'Glovo', tipo: 'glovo' },
            { etiqueta: 'Uber Eats', tipo: 'ubereats' },
            { etiqueta: 'Llamar', tipo: 'telefono' },
            { etiqueta: 'WhatsApp', tipo: 'whatsapp' }
        ],
        imagen: 'assets/images/extras-seccion-halal-zaragoza.jpg',
        imagenAlt: 'Plato casero halal de La Mif con patatas, arroz y salsa — Casco Antiguo Zaragoza'
    },

    ubicacion: {
        eyebrow: 'Encuéntranos',
        titulo1: 'Nuestra',
        titulo2: 'ubicación',
        dirTitulo: 'Dirección',
        dirTexto: 'C. de Marceliano Isábal, 5<br>Casco Antiguo, 50004 Zaragoza',
        horTitulo: 'Horario',
        horario: [
            { dias: 'Lunes – Jueves', horas: '12:00 – 01:30' },
            { dias: 'Viernes – Sábado', horas: '12:00 – 02:00' },
            { dias: 'Domingo', horas: '12:00 – 01:30' }
        ],
        telTitulo: 'Contacto',
        precioTitulo: 'Precio medio',
        precioTexto: '1 – 20 € por persona',
        ctaLlegar: 'Cómo llegar',
        direccionModal: 'C. de Marceliano Isábal, 5 · Casco Antiguo · 50004 Zaragoza'
    },

    footer: {
        tagline: 'Made in Fresh. Zaragoza · Casco Antiguo — Hamburguesas, tacos franceses y platos caseros 100% halal.',
        creditos: '© %año% La Mif. Todos los derechos reservados.'
    },

    horarioEsquema: [
        { dias: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '12:00', closes: '01:30' },
        { dias: ['Friday', 'Saturday'], opens: '12:00', closes: '02:00' },
        { dias: ['Sunday'], opens: '12:00', closes: '01:30' }
    ],

    tema: {
        colors: {
            brand: '#ff7a00',       // botones, enlaces, acentos principales
            brandDark: '#e85f00',   // hovers del color principal
            brandLight: '#ffa14d',  // degradados y detalles
            bg: '#0c0b09',          // fondo general (modo oscuro)
            bg2: '#14110e',         // fondo de secciones alternas
            surface: '#1c1814',     // tarjetas y superficies
            text: '#f5f0e7',        // texto principal
            muted: '#a89f90',       // texto secundario
            accent: '#2fbf71',      // sello HALAL y positivos
            paper: '#fbf7f0',       // secciones claras
            paperText: '#1c1913'    // texto sobre fondo claro
        },
        fonts: {
            heading: "'Bebas Neue'",
            body: "'Inter'"
        },
        animations: {
            reveal: true,           // aparición al hacer scroll
            marquee: true,          // cinta de palabras en movimiento
            hover: true             // efectos al pasar el ratón (botones, tarjetas)
        }
    }
};
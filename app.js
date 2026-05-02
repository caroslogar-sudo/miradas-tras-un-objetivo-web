/* =======================================================
   MÓDULO DE AUDIO GLOBAL (SPA & ENYA)
   ======================================================= */
window.AudioManager = (function () {
    let currentAudio = null;
    let playlist = [
        'audio/Caribbean Blue.mp3',
        'audio/One Toy Soldier.mp3',
        'audio/Only If.mp3'
    ];
    let currentIndex = 0;

    // Mezclar el aleatorio inicial de la playlist si quieres
    // playlist = playlist.sort(() => 0.5 - Math.random());

    // Volumen máximo de la aplicación: 25% para no ser intrusivo
    const MAX_VOL = 0.25;
    const FADE_STEP = 0.02;  // Paso del fade (más pequeño para que sea más suave al 25%)
    const FADE_INTERVAL = 150;

    function fadeOutAndPlayNext(audioElement) {
        if (!audioElement) return;
        let fade = setInterval(() => {
            if (audioElement.volume > FADE_STEP) {
                audioElement.volume = Math.max(0, audioElement.volume - FADE_STEP);
            } else {
                clearInterval(fade);
                audioElement.pause();
                playNextInPlaylist();
            }
        }, FADE_INTERVAL); // Fade-out suave durante unos 3s
    }

    function playNextInPlaylist() {
        if (currentIndex >= playlist.length) {
            currentIndex = 0; // Vuelve a empezar el bucle
        }
        currentAudio = new Audio(playlist[currentIndex]);
        currentAudio.volume = 0; // Comienza en silencio para el fade-in

        currentAudio.play().then(() => {
            let vol = 0;
            let fadeIn = setInterval(() => {
                if (vol < MAX_VOL - FADE_STEP) {
                    vol = Math.min(vol + FADE_STEP, MAX_VOL);
                    currentAudio.volume = vol;
                } else {
                    currentAudio.volume = MAX_VOL;
                    clearInterval(fadeIn);
                }
            }, FADE_INTERVAL);
        }).catch(err => console.log("Reproducción automática bloqueada por el navegador:", err));

        // Cuando la canción acabe, pasa a la siguiente
        currentAudio.onended = () => {
            currentIndex++;
            playNextInPlaylist();
        };
    }

    return {
        playIntro: function () {
            if (currentAudio) {
                currentAudio.pause();
            }
            currentAudio = new Audio('audio/Orinoco Flow.mp3');
            currentAudio.volume = 0; // Inicia en silencio absoluto para el fade-in
            // Sin adelanto: la canción arranca desde el principio (0s)

            currentAudio.play().then(() => {
                let vol = 0;
                let fadeIn = setInterval(() => {
                    if (vol < MAX_VOL - FADE_STEP) {
                        vol = Math.min(vol + FADE_STEP, MAX_VOL);
                        currentAudio.volume = vol;
                    } else {
                        currentAudio.volume = MAX_VOL;
                        clearInterval(fadeIn);
                    }
                }, FADE_INTERVAL); // Fade-in suave
            }).catch(err => console.log("Cortina musical bloqueada por navegador:", err));
        },
        transitionToPlaylist: function () {
            // Parar cualquier audio previo sin fade (ya no hay intro de Orinoco)
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
            }
            // Arrancar la playlist desde silencio absoluto → fade-in suave
            currentIndex = 0;
            playNextInPlaylist();
        },
        toggleMute: function () {
            if (currentAudio) {
                currentAudio.muted = !currentAudio.muted;
            }
        }
    };
})();

// =======================================================
// MÓDULO DE INTERNACIONALIZACIÓN (ES/EN)
// =======================================================
window.I18n = (function () {
    let currentLang = 'es';
    const translations = {
        es: {
            nav_welcome: "Sala de Bienvenida",
            nav_exhibition: "Exposición",
            nav_contact: "Contacto",
            contact_title: "Lleva el Arte a tu Hogar",
            contact_desc: '"Si alguna de mis miradas ha logrado detener tu tiempo y deseas llevarte a casa una parte de esta pasión, estaré encantado de atenderte y asesorarte personalmente. Escríbeme sin compromiso para consultar precios y formatos Fine Art."',
            contact_disclaimer: "* Cada fotografía pertenece a una edición exclusiva limitada a <strong>15 copias</strong> en todo el mundo.",
            buy_wa: "Consultar por WhatsApp",
            buy_email: "Consultar por Email",
            buy_note: "Venta directa de obras. Edición estrictamente limitada.",
            comments_title: "Comentarios",
            comments_rules: "Normas: Los comentarios deben ceñirse únicamente a la técnica fotográfica...",
            lb_copies_left: "Quedan {n} disponibles",
            lb_sold_out: "OBRA AGOTADA"
        },
        en: {
            nav_welcome: "Welcome Hall",
            nav_exhibition: "Exhibition",
            nav_contact: "Contact",
            contact_title: "Bring Art Into Your Home",
            contact_desc: '"If any of my gazes has managed to stop your time and you wish to take home a piece of this passion, I would be delighted to assist and advise you personally. Write to me without obligation to consult prices and Fine Art formats."',
            contact_disclaimer: "* Each photograph belongs to an exclusive edition limited to <strong>15 copies</strong> worldwide.",
            buy_wa: "Enquire via WhatsApp",
            buy_email: "Enquire via Email",
            buy_note: "Direct sale of works. Strictly limited edition.",
            comments_title: "Comments",
            comments_rules: "Rules: Comments must strictly relate to photographic technique...",
            lb_copies_left: "{n} copies remaining",
            lb_sold_out: "SOLD OUT"
        }
    };

    function updateStaticUI() {
        const t = translations[currentLang];
        // Nav Links
        const navLinks = document.querySelectorAll('.header-nav a');
        if (navLinks.length >= 3) {
            navLinks[0].innerText = t.nav_welcome;
            navLinks[1].innerText = t.nav_exhibition;
            navLinks[2].innerText = t.nav_contact;
        }
        // Contact Section
        const contactTitle = document.querySelector('.contact-section h2');
        if (contactTitle) contactTitle.innerText = t.contact_title;
        const contactDesc = document.querySelector('.contact-message');
        if (contactDesc) contactDesc.innerText = t.contact_desc;
        const contactDisc = document.querySelector('.contact-card p strong');
        if (contactDisc) contactDisc.closest('p').innerHTML = t.contact_disclaimer;

        // Lightbox static
        const commentsTitle = document.querySelector('.comments-section h4');
        if (commentsTitle) commentsTitle.innerText = t.comments_title;
        const btnBuyEmail = document.getElementById('btn-buy-email');
        if (btnBuyEmail) btnBuyEmail.innerText = t.buy_email;
        const btnBuyWa = document.getElementById('btn-buy-wa');
        if (btnBuyWa) btnBuyWa.innerText = t.buy_wa;
    }

    return {
        setLang: function (lang) {
            currentLang = lang;
            document.querySelectorAll('.btn-lang').forEach(b => b.classList.remove('active'));
            const btn = document.getElementById('btn-' + lang);
            if (btn) btn.classList.add('active');
            
            updateStaticUI();
            if (typeof renderGallery === 'function') renderGallery(document.querySelector('.filter-btn.active').dataset.filter);
            if (currentPhotoId && typeof openLightbox === 'function') openLightbox(currentPhotoId);
        },
        getLang: () => currentLang,
        t: (key) => translations[currentLang][key] || key
    };
})();

// ============================================================
// UI PREMIUM: CURSOR, OBSERVER, AUDIO WIDGET
// ============================================================
let revealObserver = null;

function initPremiumUX() {
    // 1. Cursor Custom
    const cursor = document.getElementById('custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', e => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        document.addEventListener('mouseover', e => {
            if (e.target.closest('a') || e.target.closest('button') || e.target.closest('canvas') || e.target.closest('.item-info') || e.target.closest('.audio-widget')) {
                cursor.classList.add('hovering');
            } else {
                cursor.classList.remove('hovering');
            }
        });
    }

    // 2. Observer
    revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    // 3. Audio Widget Togglable
    const widget = document.getElementById('audio-widget');
    if (widget) {
        widget.addEventListener('click', () => {
            window.AudioManager.toggleMute();
            widget.classList.toggle('muted');
        });
    }
}
initPremiumUX();

// ============================================================
// BLINDAJE ANTI-ROBO DE FOTOGRAFÍAS — NIVEL GALERÍA DE ARTE
// ============================================================
(function () {
    // 1. Bloquear menú contextual (clic derecho) (EXCEPTO EN ADMINISTRACIÓN)
    document.addEventListener('contextmenu', e => {
        if (e.target.closest('#spa-admin')) return; 
        e.preventDefault();
    });

    // 2. Bloquear arrastre de imágenes y canvas
    document.addEventListener('dragstart', e => e.preventDefault());

    // 3. Bloquear selección de texto e imágenes (EXCEPTO EN ADMINISTRACIÓN)
    document.addEventListener('selectstart', e => {
        if (e.target.closest('#spa-admin')) return;
        e.preventDefault();
    });

    // 4. Bloquear atajos peligrosos y captura de pantalla
    document.addEventListener('keydown', e => {
        if (e.target.closest('#spa-admin')) return;

        const key = e.key;
        const ctrl = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;

        // Bloqueo de atajos de inspección y guardado
        if (ctrl && ['s', 'u', 'p', 'c', 'v'].includes(key.toLowerCase())) {
            e.preventDefault();
        }
        if (ctrl && shift && ['i', 'j', 'c', 'k'].includes(key.toLowerCase())) {
            e.preventDefault();
        }
        if (key === 'F12') {
            e.preventDefault();
        }

        // Blindaje contra "Print Screen"
        if (key === 'PrintScreen') {
            alert("Esta obra está protegida por Derechos de Autor. La captura de pantalla no está permitida para preservar la exclusividad de la edición limitada.");
            e.preventDefault();
        }
    });

    // 5. Protección contra impresión (CSS Dinámico)
    const printProtection = document.createElement('style');
    printProtection.innerHTML = `
        @media print {
            body { display: none !important; }
        }
        .item-canvas-container, .lightbox-image-container {
            position: relative;
        }
        /* Capa de cristal protector */
        .item-canvas-container::after, .lightbox-image-container::after {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            z-index: 10;
            background: transparent;
        }
    `;
    document.head.appendChild(printProtection);

    // Asegurar que el cursor y el pegado funcionen en Admin
    const adminCSS = document.createElement('style');
    adminCSS.innerHTML = "#spa-admin, #spa-admin * { user-select: text !important; -webkit-user-select: text !important; cursor: auto !important; }";
    document.head.appendChild(adminCSS);
})();

// ============================================================
// CONEXIÓN CON SUPABASE (Fase 3 y 4: 100% Nube)
// ============================================================
const supabaseUrl = 'https://ofwzeenfdeimuwvhvpht.supabase.co';
const supabaseKey = 'sb_publishable_Z-mfgQPG9ikmn_0wGQsCtQ_9feQU4Ue';
const supabaseClient = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

// Catálogo de la Base de Datos
let fotografias = [];

// Context
let currentPhotoId = null;

// Carga de la firma en formato de agua
const firmaWebImg = new Image();
firmaWebImg.src = 'firma_opt4_cursiva.png';

document.fonts.ready.then(async () => {
    const hidePreloader = () => {
        const p = document.getElementById('preloader');
        if (p) {
            p.classList.add('loaded');
            setTimeout(() => p.remove(), 1500); // Darle tiempo a la opacidad
        }
    };

    const bootApp = async () => {
        await initGallery(); // Esperamos a que lleguen TODAS las fotos de Supabase
        initHeroCarousel();  // Ahora arranca el Hero con las fotos reales y mezcladas
        hidePreloader();
    };

    if (firmaWebImg.complete) {
        bootApp();
    } else {
        firmaWebImg.onload = bootApp;
        firmaWebImg.onerror = bootApp;
    }
});

// Cinematic Hero Carousel Logic
let heroImages = [];
let currentHeroIdx = 0;

function initHeroCarousel() {
    const ambient = document.getElementById('hero-ambient');
    const heroCanvas = document.getElementById('hero-carousel-canvas');
    if (!ambient || !heroCanvas) return;

    // 1. Construir lista de URLs candidatas desde la galería real
    let candidateUrls = [];
    if (fotografias && fotografias.length > 0) {
        candidateUrls = fotografias.map(foto => {
            let urlFoto = (foto.url || '').trim();
            if (urlFoto && !urlFoto.startsWith('http') && !urlFoto.startsWith('fotos/')) {
                urlFoto = 'fotos/' + urlFoto;
            }
            return urlFoto;
        }).filter(url => url !== '');
    } else {
        // Fallback por si falla internet
        heroImages = ['fotos/Cachorro 30x40.jpg'];
        startCarousel();
        return;
    }

    // 2. Precargar todas las imágenes y quedarnos SOLO con las verticales (height > width)
    //    Esto garantiza que las panorámicas nunca aparecen en la pantalla de presentación
    const checks = candidateUrls.map(url => new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(img.naturalHeight > img.naturalWidth ? url : null);
        img.onerror = () => resolve(null); // Si falla la carga, descartarla
        img.src = url;
    }));

    Promise.allSettled(checks).then(results => {
        const verticalUrls = results
            .filter(r => r.status === 'fulfilled' && r.value !== null)
            .map(r => r.value);

        // Si no hay ninguna vertical (caso improbable), usar todas para no dejar el hero vacío
        heroImages = verticalUrls.length > 0 ? verticalUrls : candidateUrls;

        // 3. Mezclar aleatoriamente y arrancar el carrusel
        heroImages = heroImages.sort(() => Math.random() - 0.5);
        startCarousel();
    });

    // Función interna: arranca el ciclo de diapositivas
    function startCarousel() {
        if (heroImages.length === 0) return;

        const drawSlide = (src) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                ambient.style.backgroundImage = `url('${src}')`;
                drawWatermarkedImage(heroCanvas, img, true);
                heroCanvas.classList.remove('fade-out');
            };
            img.onerror = () => {
                console.warn("Fallo al cargar imagen de carrusel:", src);
                heroCanvas.classList.remove('fade-out');
            };
        };

        drawSlide(heroImages[0]);

        setInterval(() => {
            heroCanvas.classList.add('fade-out');
            setTimeout(() => {
                currentHeroIdx = (currentHeroIdx + 1) % heroImages.length;
                drawSlide(heroImages[currentHeroIdx]);
            }, 1500);
        }, 6500);
    }
}

async function initGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    if (supabaseClient) {
        grid.innerHTML = '<p style="color:var(--text-secondary); text-align:center; padding: 2rem;">Digitalizando obra desde la Alta Dirección...</p>';
        try {
            const { data, error } = await supabaseClient.from('fotografias').select('*').order('created_at', { ascending: true });
            if (error) {
                console.error("Fallo final:", error);
            } else {
                fotografias = data || [];
            }
        } catch (e) {
            console.error("Corte red:", e);
        }
    }

    if (fotografias.length === 0) {
        grid.innerHTML = '<p style="color:#ff6666; text-align:center; padding: 2rem;">Mantenimiento de Galería. Volvemos enseguida.</p>';
        return;
    }

    renderGallery('all');

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderGallery(e.target.dataset.filter);
        });
    });

    const closeBtn = document.querySelector('.close-lightbox');
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    const btnBuyEmail = document.getElementById('btn-buy-email');
    const btnBuyWa = document.getElementById('btn-buy-wa');
    if (btnBuyEmail) btnBuyEmail.addEventListener('click', () => handleBuyClick('email'));
    if (btnBuyWa) btnBuyWa.addEventListener('click', () => handleBuyClick('wa'));

    const btnShareFb = document.getElementById('btn-share-fb');
    if (btnShareFb) btnShareFb.addEventListener('click', () => {
        const foto = fotografias.find(f => f.id === currentPhotoId);
        const url = window.location.href.split('#')[0] + '#' + currentPhotoId;
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent("Descubre esta obra exclusiva limitada a 15 copias: " + (foto.titulo || 'Miradas tras un Objetivo'))}`;
        window.open(fbUrl, '_blank', 'width=600,height=400');
    });

    const commentForm = document.getElementById('comment-form');
    if (commentForm) commentForm.addEventListener('submit', handleCommentSubmit);
}

// Normaliza un texto: minúsculas, sin acentos, solo la primera palabra
// Así 'Lugares de interés' coincide con el filtro 'lugares'
function slugTematica(texto) {
    if (!texto) return '';
    return texto
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
        .trim()
        .split(/\s+/)[0]; // coge solo la primera palabra
}

function renderGallery(filter) {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const isPanorama = (filter === 'panoramicas');

    // Cambiar el modo visual del contenedor según la temática
    if (isPanorama) {
        grid.className = 'grid-container grid-container--panorama';
    } else {
        grid.className = 'grid-container';
    }

    // Filtrar temática usando normalización inteligente
    let fotosToRender = (filter === 'all'
        ? fotografias
        : fotografias.filter(f => slugTematica(f.tematica) === filter));

    // Portada "Recientes": excluir penitencia y alternar fotos en cada carga
    if (filter === 'all') {
        // 1. Excluir temática 'penitencia'
        fotosToRender = fotosToRender.filter(f => slugTematica(f.tematica) !== 'penitencia');

        // 2. Sistema de alternancia: recordar las ya mostradas para no repetir
        const FOTOS_POR_CARGA = 3;
        let yaMostradas = [];
        try {
            yaMostradas = JSON.parse(sessionStorage.getItem('portada_mostradas') || '[]');
        } catch (_) { /* sessionStorage no disponible */ }

        // Separar las que aún no se han visto de las ya mostradas
        let sinVer = fotosToRender.filter(f => !yaMostradas.includes(f.id));

        // Si quedan menos fotos sin ver que las necesarias, reiniciar el ciclo
        if (sinVer.length < FOTOS_POR_CARGA) {
            yaMostradas = [];
            sinVer = [...fotosToRender];
        }

        // Mezclar aleatoriamente y seleccionar
        sinVer = sinVer.sort(() => 0.5 - Math.random());
        fotosToRender = sinVer.slice(0, FOTOS_POR_CARGA);

        // Guardar los IDs mostrados para la próxima carga
        const idsNuevos = fotosToRender.map(f => f.id);
        try {
            sessionStorage.setItem('portada_mostradas', JSON.stringify([...yaMostradas, ...idsNuevos]));
        } catch (_) { /* sessionStorage no disponible */ }
    }

    fotosToRender.forEach(foto => {
        const item = document.createElement('div');
        const canvasId = `canvas-${foto.id}`;

        // Elemento Premium: Nace invisible para despertar suavemente
        item.classList.add('reveal');

        if (isPanorama) {
            // Modo panorama: ancho total, sin recorte
            item.className += ' grid-item--panorama';
            item.onclick = () => openLightbox(foto.id);
            item.innerHTML = `
                <div class="item-canvas-container--panorama">
                    <canvas id="${canvasId}"></canvas>
                </div>
                <div class="item-info">
                    <h3>${foto.titulo}</h3>
                    <p>${foto.localidad}</p>
                </div>
            `;
        } else {
            // Modo normal: tarjeta cuadrada
            item.className += ' grid-item';
            item.onclick = () => openLightbox(foto.id);
            item.innerHTML = `
                <div class="item-canvas-container">
                    <canvas id="${canvasId}"></canvas>
                </div>
                <div class="item-info">
                    <h3>${(I18n.getLang() === 'en' && foto.titulo_en) ? foto.titulo_en : foto.titulo}</h3>
                    <p>${foto.localidad}</p>
                </div>
            `;
        }

        grid.appendChild(item);

        // Observador de aparición
        if (revealObserver) revealObserver.observe(item);

        const canvas = document.getElementById(canvasId);
        const img = new Image();

        // Auto-correción de URL: limpia espacios y añade 'fotos/' si falta
        let urlFoto = (foto.url || '').trim();
        if (urlFoto && !urlFoto.startsWith('http') && !urlFoto.startsWith('fotos/')) {
            urlFoto = 'fotos/' + urlFoto;
        }
        img.src = urlFoto;
        img.onload = () => {
            // En panorama: el canvas toma las dimensiones reales de la imagen (sin recorte)
            if (isPanorama) {
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.style.width = '100%';
                canvas.style.height = 'auto';
            }
            drawWatermarkedImage(canvas, img, false);
        };
        img.onerror = () => {
            console.warn(`No se encontró la foto: ${urlFoto} — verifica el nombre exacto en Hostinger`);
            drawFallbackImage(canvas, foto.titulo);
        };
    });
}

function drawWatermarkedImage(canvas, img, isHero) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (isHero) {
        return;
    }

    ctx.save();

    if (firmaWebImg && firmaWebImg.complete && firmaWebImg.naturalWidth > 0) {
        const isSmall = canvas.width < 800;
        const targetWidth = isSmall ? canvas.width * 0.35 : canvas.width * 0.25;
        const ratio = targetWidth / firmaWebImg.naturalWidth;
        const targetHeight = firmaWebImg.naturalHeight * ratio;

        const marginX = canvas.width * 0.03;
        const marginY = canvas.height * 0.03;

        const posLeftX = marginX;
        const posRightX = canvas.width - targetWidth - marginX;
        const posY = canvas.height - targetHeight - marginY;

        const getVariance = (x, y) => {
            try {
                const imageData = ctx.getImageData(x, y, targetWidth, targetHeight).data;
                let sum = 0, sqSum = 0, count = 0;
                for (let i = 0; i < imageData.length; i += 16) {
                    const lum = 0.299 * imageData[i] + 0.587 * imageData[i + 1] + 0.114 * imageData[i + 2];
                    sum += lum;
                    sqSum += lum * lum;
                    count++;
                }
                const mean = sum / count;
                return (sqSum / count) - (mean * mean);
            } catch (e) {
                return 0;
            }
        };

        const varLeft = getVariance(posLeftX, posY);
        const varRight = getVariance(posRightX, posY);
        const posX = (varLeft < varRight) ? posLeftX : posRightX;

        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        ctx.drawImage(firmaWebImg, posX, posY, targetWidth, targetHeight);
    } else {
        const isSmall = canvas.width < 800;
        const sigSize = isSmall ? Math.floor(canvas.width * 0.06) : Math.floor(canvas.width * 0.03);
        ctx.globalAlpha = 0.8;
        ctx.font = `${sigSize}px "Playfair Display", serif`;
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = 'right';
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.textAlign = 'left';
        ctx.fillText("Óscar López Fotógrafo", 20, canvas.height - 30);
    }

    ctx.restore();
}

function drawFallbackImage(canvas, text) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = 600;
    canvas.height = 400;
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#555';
    ctx.font = '24px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Fotografía Pendiente: ' + text, canvas.width / 2, canvas.height / 2);
    ctx.fillText('(Añadir en carpeta "fotos")', canvas.width / 2, canvas.height / 2 + 30);
}

function openLightbox(id) {
    currentPhotoId = id;
    const foto = fotografias.find(f => f.id === id);
    if (!foto) return;

    document.getElementById('lb-title').innerText = (I18n.getLang() === 'en' && foto.titulo_en) ? foto.titulo_en : foto.titulo;
    document.getElementById('lb-location').innerText = `${foto.localidad} - ${foto.anio}`;
    document.getElementById('lb-desc').innerText = (I18n.getLang() === 'en' && foto.descripcion_en) ? foto.descripcion_en : foto.descripcion;

    // Mostrar información de edición limitada
    const total = foto.copias_totales || 15;
    const vendidas = foto.copias_vendidas || 0;
    const disponibles = total - vendidas;
    
    const buyNote = document.querySelector('.buy-note');
    if (buyNote) {
        if (disponibles > 0) {
            const text = I18n.t('lb_copies_left').replace('{n}', disponibles);
            buyNote.innerHTML = `${I18n.t('buy_note')} <strong>Edición limitada a ${total} copias. ${text}.</strong>`;
            buyNote.style.color = disponibles <= 3 ? '#ff6666' : 'var(--text-secondary)';
        } else {
            buyNote.innerHTML = `<strong style="color: #ff6666;">${I18n.t('lb_sold_out')}.</strong> Edición limitada de ${total} copias completa.`;
        }
    }

    const canvas = document.getElementById('lightbox-canvas');
    const img = new Image();
    img.src = foto.url;
    img.onload = () => drawWatermarkedImage(canvas, img, false);
    img.onerror = () => drawFallbackImage(canvas, foto.titulo);

    renderComments(id);
    document.getElementById('lightbox').classList.add('active');
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    currentPhotoId = null;
}

function handleBuyClick(method) {
    const foto = fotografias.find(f => f.id === currentPhotoId);
    if (!foto) return;

    const message = `Hola Óscar, estoy interesado en adquirir una copia de la obra "${foto.titulo}". ¿Podrías darme más información?`;
    
    if (method === 'email') {
        window.location.href = `mailto:miradas.oscarlopez@gmail.com?subject=Interés en obra: ${foto.titulo}&body=${encodeURIComponent(message)}`;
    } else {
        const waUrl = `https://wa.me/34614443759?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    }
}

async function renderComments(fotoId) {
    const list = document.getElementById('comments-list');
    list.innerHTML = '<p style="color: #666; font-size: 0.9rem;">Cargando opiniones...</p>';

    if (!supabaseClient) return;

    const { data: comments, error } = await supabaseClient
        .from('comentarios')
        .select('*')
        .eq('foto_id', fotoId)
        .order('created_at', { ascending: true });

    if (error || !comments || comments.length === 0) {
        list.innerHTML = '<p style="color: #666; font-size: 0.9rem;">Sé el primero en comentar sobre la técnica de esta fotografía.</p>';
        return;
    }

    list.innerHTML = '';
    comments.forEach(c => {
        const div = document.createElement('div');
        div.className = 'comment';
        div.innerHTML = `
            <div>
                <span class="comment-author">${DOMPurify(c.nombre)}</span>
                <span class="comment-date">${c.fecha}</span>
            </div>
            <div class="comment-content">${DOMPurify(c.texto)}</div>
        `;
        list.appendChild(div);
    });
}

async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!currentPhotoId || !supabaseClient) return;

    const nameInput = document.getElementById('comment-name');
    const textInput = document.getElementById('comment-text');
    const btnSubmit = e.target.querySelector('button');

    btnSubmit.disabled = true;
    btnSubmit.innerText = 'Publicando...';

    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;

    const { error } = await supabaseClient
        .from('comentarios')
        .insert([
            { foto_id: currentPhotoId, nombre: nameInput.value, texto: textInput.value, fecha: dateStr }
        ]);

    if (error) {
        alert("Lo sentimos, error al publicar el comentario.");
    } else {
        document.getElementById('comment-form').reset();
        await renderComments(currentPhotoId);
    }

    btnSubmit.disabled = false;
    btnSubmit.innerText = 'Publicar';
}

function DOMPurify(str) {
    let div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
}

// ============================================================
// SISTEMA DE ADMINISTRACIÓN Y AUTOMATIZACIÓN (ÓSCAR LÓPEZ)
// ============================================================
(function() {
    const loginForm = document.getElementById('login-form');
    const authScreen = document.getElementById('admin-login-screen');
    const ctrlPanel = document.getElementById('admin-control-panel');
    const loginError = document.getElementById('login-error');

    if (!loginForm) return;

    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = "caroslogar@gmail.com";
        const password = document.getElementById('admin-password').value;
        const btnSubmit = loginForm.querySelector('button');

        loginError.style.color = "var(--text-dim)";
        loginError.innerText = "Conectando con el servidor...";
        btnSubmit.disabled = true;

        console.log("--- Iniciando Intento de Acceso ---");
        console.log("Email:", email);

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            
            if (error) {
                console.error("Error de Supabase:", error.message, error.status);
                
                if (error.message.includes('Email not confirmed')) {
                    loginError.style.color = "#ffaa00";
                    loginError.innerHTML = `Cuenta pendiente de confirmación.<br><button id="btn-resend-email" style="background:transparent; border:1px solid var(--accent-gold); color:var(--accent-gold); padding:5px 10px; border-radius:15px; font-size:0.7rem; margin-top:10px; cursor:pointer;">Reenviar correo de verificación</button>`;
                    
                    document.getElementById('btn-resend-email').onclick = async () => {
                        const { error: resendError } = await supabaseClient.auth.resend({
                            type: 'signup',
                            email: email
                        });
                        if (resendError) {
                            alert("Error al reenviar: " + resendError.message);
                        } else {
                            alert("Correo de confirmación enviado a " + email + ". Por favor, revisa tu bandeja de entrada o SPAM.");
                        }
                    };
                } else if (error.message.includes('Invalid login credentials')) {
                    loginError.style.color = "#ff6666";
                    loginError.innerText = "Credenciales incorrectas. Verifica tu contraseña.";
                } else {
                    loginError.style.color = "#ff6666";
                    loginError.innerText = "Fallo: " + error.message;
                }
                btnSubmit.disabled = false;
                return;
            }

            // Éxito: El usuario está logueado y confirmado
            console.log("Acceso concedido para:", data.user.email);
            authScreen.classList.add('hidden');
            ctrlPanel.classList.remove('hidden');
            loginError.innerText = "";
        } catch (err) {
            console.error("Fallo crítico en el cliente:", err);
            loginError.style.color = "#ff6666";
            loginError.innerText = "Fallo de conexión. Revisa tu internet.";
            btnSubmit.disabled = false;
        }
    };

    // --- Lógica de Subida y Automatización ---
    const photoFile = document.getElementById('photo-file');
    const btnPublish = document.getElementById('btn-publish-all');
    const btnUndo = document.getElementById('btn-undo-upload');
    const publishStatus = document.getElementById('publish-status');
    const photoPreview = document.getElementById('photo-preview');

    let lastUploadedId = null;
    let lastUploadedPath = null;

    if(photoFile) {
        photoFile.onchange = (e) => {
            const file = e.target.files[0];
            if(file) {
                photoPreview.src = URL.createObjectURL(file);
                photoPreview.style.display = 'block';
                document.getElementById('upload-status').innerText = "Imagen lista: " + file.name;
                btnUndo.classList.add('hidden'); // Ocultar deshacer al elegir nueva foto
            }
        };
    }

    if(btnPublish) {
        btnPublish.onclick = async () => {
            const file = photoFile.files[0];
            const title = document.getElementById('photo-title').value;
            const titleEn = document.getElementById('photo-title-en').value;
            const location = document.getElementById('photo-location').value;
            const category = document.getElementById('photo-category').value;
            const description = document.getElementById('photo-description').value;
            const descriptionEn = document.getElementById('photo-description-en').value;
            const totalCopies = parseInt(document.getElementById('photo-total-copies').value) || 15;
            const soldCopies = parseInt(document.getElementById('photo-sold-copies').value) || 0;

            if(!file || !title) {
                alert("Es esencial subir la foto y ponerle un título.");
                return;
            }

            publishStatus.style.color = "var(--text-dim)";
            publishStatus.innerText = "Iniciando subida a la nube...";
            btnPublish.disabled = true;

            try {
                // 1. Subir a Supabase Storage (Bucket 'fotos')
                const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
                const { data: upData, error: upError } = await supabaseClient.storage
                    .from('fotos')
                    .upload(fileName, file);

                if (upError) throw upError;

                // 2. Obtener URL pública
                const { data: urlData } = supabaseClient.storage.from('fotos').getPublicUrl(fileName);
                const publicUrl = urlData.publicUrl;

                // 3. Crear registro en la tabla 'fotografias'
                const { data: dbData, error: dbError } = await supabaseClient.from('fotografias').insert([
                    { 
                        titulo: title, 
                        titulo_en: titleEn,
                        localidad: location, 
                        tematica: category, 
                        descripcion: description, 
                        descripcion_en: descriptionEn,
                        url: publicUrl,
                        copias_totales: totalCopies,
                        copias_vendidas: soldCopies
                    }
                ]).select();

                if (dbError) throw dbError;

                // Guardar referencias para poder deshacer
                lastUploadedId = dbData[0].id;
                lastUploadedPath = fileName;

                publishStatus.style.color = "var(--accent)";
                publishStatus.innerText = "¡Obra publicada con éxito!";
                btnUndo.classList.remove('hidden');
                
                // Limpiar formulario para la siguiente foto (MULTISUBIDA)
                document.getElementById('photo-title').value = "";
                document.getElementById('photo-description').value = "";
                photoFile.value = "";
                photoPreview.style.display = "none";
                document.getElementById('upload-status').innerText = "📸 Seleccionar otra fotografía";
                btnPublish.disabled = false;

            } catch (err) {
                console.error(err);
                publishStatus.style.color = "#ff6666";
                publishStatus.innerText = "Error en el proceso: " + err.message;
                btnPublish.disabled = false;
            }
        };
    }

    if(btnUndo) {
        btnUndo.onclick = async () => {
            if(!lastUploadedId || !lastUploadedPath) return;

            if(!confirm("¿Estás seguro de que quieres eliminar esta última subida de la web?")) return;

            btnUndo.innerText = "Eliminando...";

            try {
                // 1. Borrar de la base de datos
                await supabaseClient.from('fotografias').delete().eq('id', lastUploadedId);
                // 2. Borrar del Storage
                await supabaseClient.storage.from('fotos').remove([lastUploadedPath]);

                publishStatus.style.color = "var(--text-dim)";
                publishStatus.innerText = "Subida eliminada correctamente.";
                btnUndo.classList.add('hidden');
                lastUploadedId = null;
                lastUploadedPath = null;
            } catch (err) {
                alert("Error al deshacer: " + err.message);
            } finally {
                btnUndo.innerText = "Deshacer última publicación";
            }
        };
    }

    // --- ACTIVADOR SECRETO ---
    // Si la URL contiene ?admin, saltamos directamente a la vista protegida
    if (window.location.search.includes('admin')) {
        // Usamos un pequeño retardo para asegurar que el router está listo
        setTimeout(() => {
            if(window.AppRouter) window.AppRouter.goTo('admin');
        }, 500);
    }
})();

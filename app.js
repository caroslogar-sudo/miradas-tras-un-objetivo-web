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
// BLINDAJE ANTI-ROBO DE FOTOGRAFÍAS — NIVEL MÁXIMO
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

    // 4. Bloquear atajos peligrosos (EXCEPTO EN ADMINISTRACIÓN)
    document.addEventListener('keydown', e => {
        // Si estamos en administración, permitimos TODO el teclado (Ctrl+V, etc)
        if (e.target.closest('#spa-admin')) return;

        const key = e.key;
        const ctrl = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;

        if (ctrl && ['s', 'u', 'p'].includes(key.toLowerCase())) {
            e.preventDefault(); return false;
        }
        if (ctrl && shift && ['i', 'j', 'c', 'k'].includes(key.toLowerCase())) {
            e.preventDefault(); return false;
        }
        if (key === 'F12' || key === 'PrintScreen') {
            e.preventDefault(); return false;
        }
    });

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
    // 1. Llenar heroImages con toda la galería real en lugar del array fijo antiguo
    if (fotografias && fotografias.length > 0) {
        heroImages = fotografias.map(foto => {
            let urlFoto = (foto.url || '').trim();
            if (urlFoto && !urlFoto.startsWith('http') && !urlFoto.startsWith('fotos/')) {
                urlFoto = 'fotos/' + urlFoto;
            }
            return urlFoto;
        }).filter(url => url !== ''); // Quitamos URLs inválidas

        // 2. Mezclamos todas las fotos aleatoriamente
        heroImages = heroImages.sort(() => Math.random() - 0.5);
    } else {
        // Fallback por si falla internet
        heroImages = ['fotos/Cachorro 30x40.jpg']; 
    }

    const ambient = document.getElementById('hero-ambient');
    const heroCanvas = document.getElementById('hero-carousel-canvas');
    if (!ambient || !heroCanvas || heroImages.length === 0) return;

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
                    <h3>${foto.titulo}</h3>
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

    document.getElementById('lb-title').innerText = foto.titulo;
    document.getElementById('lb-location').innerText = `${foto.localidad} - ${foto.anio}`;
    document.getElementById('lb-desc').innerText = foto.descripcion;

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
    if (!currentPhotoId) return;
    const foto = fotografias.find(f => f.id === currentPhotoId);

    const introText = `Hola Óscar, estoy interesado en adquirir los derechos o una copia impresa de alta calidad de tu fotografía "${foto.titulo}" (ID: ${foto.id}, Localidad: ${foto.localidad}). \n\nPor favor, me gustaría que me informaras sobre formatos y precios.\n\nGracias.`;

    if (method === 'email') {
        const mailtoLink = `mailto:caroslogar@yahoo.com?subject=Consulta de compra: ${encodeURIComponent(foto.titulo)}&body=${encodeURIComponent(introText)}`;
        window.location.href = mailtoLink;
    } else {
        const waLink = `https://wa.me/34614443759?text=${encodeURIComponent(introText)}`;
        window.open(waLink, '_blank');
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
        loginError.style.color = "var(--text-dim)";
        loginError.innerText = "Verificando identidad...";

        try {
            // Primer intento: Login
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            
            if (error) {
                // Si el error es de credenciales inválidas y es la primera vez, intentamos registro
                if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
                    const { data: regData, error: regError } = await supabaseClient.auth.signUp({ email, password });
                    if (regError) {
                        loginError.style.color = "#ff6666";
                        loginError.innerText = "Error: " + regError.message;
                    } else {
                        loginError.style.color = "var(--accent)";
                        loginError.innerText = "¡Cuenta proyectada! Revisa caroslogar@gmail.com para confirmar y vuelve a entrar.";
                    }
                } else {
                    loginError.style.color = "#ff6666";
                    loginError.innerText = "Acceso denegado: " + error.message;
                }
                return;
            }

            // Login con éxito
            authScreen.classList.add('hidden');
            ctrlPanel.classList.remove('hidden');
            loginError.innerText = "";
        } catch (err) {
            loginError.style.color = "#ff6666";
            loginError.innerText = "Fallo de conexión con el estudio.";
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
            const location = document.getElementById('photo-location').value;
            const category = document.getElementById('photo-category').value;
            const description = document.getElementById('photo-description').value;

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
                        localidad: location, 
                        tematica: category, 
                        descripcion: description, 
                        url: publicUrl 
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

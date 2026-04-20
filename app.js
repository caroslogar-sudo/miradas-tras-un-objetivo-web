/* =======================================================
   MÓDULO DE AUDIO GLOBAL (SPA & ENYA)
   ======================================================= */
window.AudioManager = (function() {
    let currentAudio = null;
    let playlist = [
        'audio/Caribbean Blue.mp3',
        'audio/One Toy Soldier.mp3',
        'audio/Only If.mp3'
    ];
    let currentIndex = 0;
    
    // Mezclar el aleatorio inicial de la playlist si quieres
    // playlist = playlist.sort(() => 0.5 - Math.random());
    
    function fadeOutAndPlayNext(audioElement) {
        if (!audioElement) return;
        let fade = setInterval(() => {
            if (audioElement.volume > 0.05) {
                audioElement.volume = Math.max(0, audioElement.volume - 0.05);
            } else {
                clearInterval(fade);
                audioElement.pause();
                audioElement.volume = 0.5;
                playNextInPlaylist();
            }
        }, 150); // Fade-out suave durante unos 3s
    }

    function playNextInPlaylist() {
        if (currentIndex >= playlist.length) {
            currentIndex = 0; // Vuelve a empezar el bucle
        }
        currentAudio = new Audio(playlist[currentIndex]);
        currentAudio.volume = 0; // Comienza a Cero para hacer Fade-in
        
        currentAudio.play().then(() => {
            let vol = 0;
            let fadeIn = setInterval(() => {
                if(vol < 0.45) {
                    vol += 0.05;
                    currentAudio.volume = vol;
                } else {
                    currentAudio.volume = 0.5;
                    clearInterval(fadeIn);
                }
            }, 150);
        }).catch(err => console.log("Reproducción automática bloqueada por el navegador:", err));

        // Cuando la canción acabe, pasa a la siguiente
        currentAudio.onended = () => {
            currentIndex++;
            playNextInPlaylist();
        };
    }

    return {
        playIntro: function() {
            if (currentAudio) {
                currentAudio.pause();
            }
            currentAudio = new Audio('audio/Orinoco Flow.mp3');
            
            // ADELANTO DE CANCIÓN: Adelantamos "Orinoco Flow" unos 15 segundos
            currentAudio.currentTime = 15; 
            currentAudio.volume = 0; // Inicia silenciado para el fade in
            
            currentAudio.play().then(() => {
                let vol = 0;
                let fadeIn = setInterval(() => {
                    if(vol < 0.45) {
                        vol += 0.05;
                        currentAudio.volume = vol;
                    } else {
                        currentAudio.volume = 0.5;
                        clearInterval(fadeIn);
                    }
                }, 150); // Transición suave (de menos a más) de casi unos 3 segundos
            }).catch(err => console.log("Cortina musical bloqueada por navegador:", err));
        },
        transitionToPlaylist: function() {
            if (currentAudio && currentAudio.src.includes('Orinoco')) {
                fadeOutAndPlayNext(currentAudio);
            } else if (!currentAudio) {
                playNextInPlaylist();
            }
        },
        toggleMute: function() {
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
            if(entry.isIntersecting) {
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
(function() {
    // 1. Bloquear menú contextual (clic derecho) en toda la página
    document.addEventListener('contextmenu', e => e.preventDefault());

    // 2. Bloquear arrastre de imágenes y canvas
    document.addEventListener('dragstart', e => e.preventDefault());

    // 3. Bloquear selección de texto e imágenes
    document.addEventListener('selectstart', e => e.preventDefault());

    // 4. Bloquear atajos de teclado peligrosos
    document.addEventListener('keydown', e => {
        const key = e.key;
        const ctrl = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;

        // Ctrl+S (guardar), Ctrl+U (código fuente), Ctrl+P (imprimir)
        if (ctrl && ['s', 'u', 'p'].includes(key.toLowerCase())) {
            e.preventDefault(); return false;
        }
        // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools)
        if (ctrl && shift && ['i', 'j', 'c', 'k'].includes(key.toLowerCase())) {
            e.preventDefault(); return false;
        }
        // F12 (DevTools), PrintScreen
        if (key === 'F12' || key === 'PrintScreen') {
            e.preventDefault(); return false;
        }
    });
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

document.fonts.ready.then(() => {
    const hidePreloader = () => {
        const p = document.getElementById('preloader');
        if(p) {
            p.classList.add('loaded');
            setTimeout(() => p.remove(), 1500); // Darle tiempo a la opacidad
        }
    };

    if(firmaWebImg.complete) {
        initGallery();
        initHeroCarousel();
        hidePreloader();
    } else {
        firmaWebImg.onload = () => {
            initGallery();
            initHeroCarousel();
            hidePreloader();
        };
        firmaWebImg.onerror = () => {
            initGallery();
            initHeroCarousel();
            hidePreloader();
        };
    }
});

// Cinematic Hero Carousel Logic
const heroImages = [
    'fotos/Cachorro 30x40.jpg',
    'fotos/Cristo de la Sed 30x40.jpg',
    'fotos/Candelaria 30x40.jpg',
    'fotos/Cristo Buena Muerte 30x40.jpg'
];
let currentHeroIdx = 0;

function initHeroCarousel() {
    const ambient = document.getElementById('hero-ambient');
    const heroCanvas = document.getElementById('hero-carousel-canvas');
    if(!ambient || !heroCanvas) return;
    
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
            heroCanvas.classList.remove('fade-out'); // Evitar que el canvas se quede invisible
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
        } catch(e) {
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
        } catch(_) { /* sessionStorage no disponible */ }
        
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
        } catch(_) { /* sessionStorage no disponible */ }
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
                    const lum = 0.299*imageData[i] + 0.587*imageData[i+1] + 0.114*imageData[i+2];
                    sum += lum;
                    sqSum += lum * lum;
                    count++;
                }
                const mean = sum / count;
                return (sqSum / count) - (mean * mean);
            } catch(e) {
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
    ctx.fillRect(0,0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#555';
    ctx.font = '24px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Fotografía Pendiente: ' + text, canvas.width/2, canvas.height/2);
    ctx.fillText('(Añadir en carpeta "fotos")', canvas.width/2, canvas.height/2 + 30);
}

function openLightbox(id) {
    currentPhotoId = id;
    const foto = fotografias.find(f => f.id === id);
    if(!foto) return;
    
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
    if(!currentPhotoId) return;
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
    
    if(!supabaseClient) return;
    
    const { data: comments, error } = await supabaseClient
        .from('comentarios')
        .select('*')
        .eq('foto_id', fotoId)
        .order('created_at', { ascending: true });
    
    if(error || !comments || comments.length === 0) {
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
    if(!currentPhotoId || !supabaseClient) return;
    
    const nameInput = document.getElementById('comment-name');
    const textInput = document.getElementById('comment-text');
    const btnSubmit = e.target.querySelector('button');
    
    btnSubmit.disabled = true;
    btnSubmit.innerText = 'Publicando...';
    
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2,'0')}-${(today.getMonth()+1).toString().padStart(2,'0')}-${today.getFullYear()}`;
    
    const { error } = await supabaseClient
        .from('comentarios')
        .insert([
            { foto_id: currentPhotoId, nombre: nameInput.value, texto: textInput.value, fecha: dateStr }
        ]);
        
    if(error) {
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

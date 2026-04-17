-- -------------------------------------------------------------
-- SQL SETUP PARA SUPABASE
-- Proyecto: Miradas tras un Objetivo - Óscar López
-- -------------------------------------------------------------

-- 0. Limpieza previa (por si se ejecuta el código más de una vez por error)
DROP TABLE IF EXISTS public.comentarios CASCADE;
DROP TABLE IF EXISTS public.fotografias CASCADE;

-- 1. Tabla de Fotografías
CREATE TABLE public.fotografias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    localidad TEXT DEFAULT 'Desconocida',
    anio INTEGER DEFAULT 2026,
    url TEXT NOT NULL,
    tematica TEXT DEFAULT 'all',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar seguridad mínima (para permitir lectura pública)
ALTER TABLE public.fotografias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Fotografias publicas" ON public.fotografias FOR SELECT USING (true);


-- 2. Tabla de Comentarios
CREATE TABLE public.comentarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    foto_id UUID REFERENCES public.fotografias(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    texto TEXT NOT NULL,
    fecha TEXT NOT NULL, -- Guardaremos un String para formatear la fecha como DD-MM-YYYY fácilmente
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar seguridad mínima para comentarios (lectura y escritura pública temporalmente)
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comentarios publicos lectura" ON public.comentarios FOR SELECT USING (true);
CREATE POLICY "Comentarios publicos escritura" ON public.comentarios FOR INSERT WITH CHECK (true);


-- -------------------------------------------------------------
-- 3. INSERCIÓN DE DATOS INICIALES (MIGRACIÓN DESDE APP.JS)
-- (Copia esto tal cual para poblar tu base de datos con las fotos de prueba)
-- -------------------------------------------------------------

INSERT INTO public.fotografias (id, titulo, descripcion, localidad, anio, url, tematica) VALUES
('b3c299c8-04f8-4b71-b062-8f15d2a8bce1', 'Acólito', 'Detalle de un acólito en plena procesión, envuelto en el incienso.', 'Sevilla', 2024, 'fotos/Acolito.jpg', 'semanasanta'),
('cae0591e-b83c-4e78-9e5c-0de5c44ea490', 'El Cachorro', 'Impresionante vista del Cristo de la Expiración (El Cachorro).', 'Sevilla', 2024, 'fotos/Cachorro 30x40.jpg', 'semanasanta'),
('eabcbaf1-671c-4b53-a7bb-b9b18dc8e841', 'Cachorro en la Calle', 'El Cachorro avanzando por las calles atrayendo miradas.', 'Sevilla', 2024, 'fotos/Cachorro bar.jpg', 'semanasanta'),
('70a04edb-bc25-45a8-bd2e-bcbfd53ff9dc', 'Virgen de la Candelaria', 'Retrato de la Virgen alumbrada por la candelería.', 'Sevilla', 2024, 'fotos/Candelaria 30x40.jpg', 'semanasanta'),
('a3c30620-8012-4ee4-80ee-6c8a0026e6f1', 'Señor de las Penas', 'Detalle sobrecogedor del Señor de las Penas.', 'Sevilla', 2024, 'fotos/Copia de Señor de las Penas.jpg', 'semanasanta'),
('d5a23055-6679-4bc2-af83-c24eb29de0d8', 'Cristo de la Buena Muerte', 'Majestuosa estampa del Cristo de la Buena Muerte.', 'Sevilla', 2024, 'fotos/Cristo Buena Muerte 30x40.jpg', 'semanasanta'),
('f8803ab4-3d92-49df-8419-f559bc8bbd36', 'Cristo de la Sed', 'Impactante fotografía del Santísimo Cristo de la Sed.', 'Sevilla', 2024, 'fotos/Cristo de la Sed 30x40.jpg', 'semanasanta');

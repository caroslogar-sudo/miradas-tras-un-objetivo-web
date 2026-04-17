import os
import sys
from PIL import Image, ImageOps, ImageFilter, ImageStat

def procesar_firma(firma_path):
    """
    Toma una firma con fondo blanco y texto negro.
    La convierte en texto blanco con fondo transparente.
    """
    try:
        firma = Image.open(firma_path).convert('L') # Convertir a escala de grises
        firma_inv = ImageOps.invert(firma) # Invertir: texto pasa a ser blanco, fondo negro
        
        # El canal alfa usará esta imagen invertida (lo blanco será opaco (texto), lo negro será transparente (fondo))
        firma_transparente = Image.new('RGBA', firma.size, (255, 255, 255, 255))
        firma_transparente.putalpha(firma_inv)
        
        # Guardar una versión procesada para la web
        web_firma_path = os.path.join(os.path.dirname(firma_path), "firma_transparente.png")
        firma_transparente.save(web_firma_path)
        print("✅ Firma procesada para su uso transparente en web y fotos.")
        
        return firma_transparente
    except Exception as e:
        print(f"❌ Error al procesar la firma: {e}")
        return None

def add_watermark(input_folder, output_folder, firma_path):
    print(f"🔧 Iniciando proceso de firma automática en: {input_folder}")
    
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        print(f"📂 Carpeta de salida creada: {output_folder}")
        
    # Procesar la firma de imagen
    firma_img = procesar_firma(firma_path)
    if not firma_img:
        sys.exit(1)
        
    valid_extensions = ('.jpg', '.jpeg', '.png')
    files_processed = 0
    
    for filename in os.listdir(input_folder):
        if not filename.lower().endswith(valid_extensions):
            continue
            
        input_path = os.path.join(input_folder, filename)
        output_path = os.path.join(output_folder, filename)
        
        try:
            with Image.open(input_path) as base_img:
                img = base_img.convert("RGBA")
                width, height = img.size
                
                # Crear capa para la marca de agua
                watermark_layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
                
                # Calcular el tamaño de la firma en base a la foto principal (ej: 25% del ancho)
                firma_width = int(width * 0.25)
                # Mantener la proporción
                firma_ratio = firma_width / float(firma_img.size[0])
                firma_height = int(float(firma_img.size[1]) * float(firma_ratio))
                
                firma_resized = firma_img.resize((firma_width, firma_height), Image.Resampling.LANCZOS)
                
                # Márgenes
                margin_x = int(width * 0.03)
                margin_y = int(height * 0.03)
                
                # Posición teórica AI: Izquierda
                pos_x_left = margin_x
                pos_y_left = height - firma_height - margin_y
                
                # Posición teórica AI: Derecha
                pos_x_right = width - firma_width - margin_x
                pos_y_right = height - firma_height - margin_y
                
                # Recortes virtuales sobre la imagen original para analizar la zona
                # Cajas: (left, upper, right, lower)
                box_left = (pos_x_left, pos_y_left, pos_x_left + firma_width, pos_y_left + firma_height)
                box_right = (pos_x_right, pos_y_right, pos_x_right + firma_width, pos_y_right + firma_height)
                
                region_left = base_img.crop(box_left).convert('L')
                region_right = base_img.crop(box_right).convert('L')
                
                # Calcular la suma de los valores de los bordes (detectar texturas y detalles)
                edges_left = region_left.filter(ImageFilter.FIND_EDGES)
                edges_right = region_right.filter(ImageFilter.FIND_EDGES)
                
                stat_left = ImageStat.Stat(edges_left)
                stat_right = ImageStat.Stat(edges_right)
                
                # La zona con menor intensidad de bordes se considera la más "limpia"
                is_left_cleaner = stat_left.sum[0] < stat_right.sum[0]
                
                if is_left_cleaner:
                    pos_x = pos_x_left
                    pos_y = pos_y_left
                    print(f"  -> Firma posicionada a la IZQUIERDA en {filename}")
                else:
                    pos_x = pos_x_right
                    pos_y = pos_y_right
                    print(f"  -> Firma posicionada a la DERECHA en {filename}")
                
                # Pegar la firma en la capa
                watermark_layer.paste(firma_resized, (pos_x, pos_y), mask=firma_resized)
                
                # Combinar imagen original con capa de firma
                watermarked = Image.alpha_composite(img, watermark_layer)
                
                # Convertir de vuelta a RGB para guardar como JPG
                final_image = watermarked.convert("RGB")
                final_image.save(output_path, quality=95)
                
                print(f"✅ Firmada con imagen: {filename}")
                files_processed += 1
                
        except Exception as e:
            print(f"❌ Error al procesar {filename}: {e}")
            
    print(f"\n🎉 Proceso completado. Se han firmado {files_processed} fotografías.")
    print(f"Puedes encontrar tus fotos protegidas en la carpeta: {os.path.abspath(output_folder)}")

if __name__ == "__main__":
    print("-" * 50)
    print(" Herramienta de Firma de Fotografías con Logotipo - Óscar López ")
    print("-" * 50)
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_dir = os.path.join(base_dir, "fotos_originales")
    output_dir = os.path.join(base_dir, "fotos")
    firma_file = os.path.join(base_dir, "firma.png") # o .jpg
    
    # Comprobar si existe la firma (busca png o jpg o jpge)
    if not os.path.exists(firma_file):
        # Intentar buscar versiones jpg
        alt_jpg = os.path.join(base_dir, "firma.jpg")
        alt_jpeg = os.path.join(base_dir, "firma.jpeg")
        if os.path.exists(alt_jpg):
            firma_file = alt_jpg
        elif os.path.exists(alt_jpeg):
            firma_file = alt_jpeg
        else:
            print(f"⚠️ NO SE ENCUENTRA EL ARCHIVO DE FIRMA.")
            print("➡️ POR FAVOR: Guarda la imagen de tu firma en la carpeta principal del proyecto")
            print("   asegurándote de que se llame 'firma.png' o 'firma.jpg'.")
            sys.exit(0)
    
    if not os.path.exists(input_dir):
        os.makedirs(input_dir)
        print(f"⚠️ Se ha creado la carpeta '{input_dir}'.")
        print("➡️ POR FAVOR: Coloca aquí tus fotografías originales y vuelve a ejecutar.")
        sys.exit(0)
        
    if not os.listdir(input_dir):
        print(f"⚠️ La carpeta '{input_dir}' está vacía.")
        print("➡️ POR FAVOR: Coloca tus fotografías originales en ella y vuelve a ejecutar.")
        sys.exit(0)
        
    add_watermark(input_dir, output_dir, firma_file)

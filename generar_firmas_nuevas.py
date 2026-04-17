import os
from PIL import Image, ImageDraw, ImageFont

def create_signature(filename, name_text, sub_text):
    width = 1200
    height = 500
    img = Image.new('RGBA', (width, height), (255, 255, 255, 0))
    d = ImageDraw.Draw(img)
    
    # Fuentes para el nombre (estilo antiguo inclinado / cursiva clásica)
    font_paths = [
        r"C:\Windows\Fonts\georgiai.ttf",  # Georgia Italic (muy legible, clásica y bella)
        r"C:\Windows\Fonts\timesi.ttf",    # Times Italic
        r"C:\Windows\Fonts\palaI.ttf"      # Palatino Italic
    ]
    
    font_main = None
    for p in font_paths:
        if os.path.exists(p):
            font_main = ImageFont.truetype(p, 140)  # Nombre protagonista
            break
    if not font_main:
        font_main = ImageFont.load_default()
        
    # Fuentes para FOTOGRAFÍA (se mantiene más recta o sólida para contraste, pero clásica)
    sub_font_paths = [
        r"C:\Windows\Fonts\georgia.ttf",
        r"C:\Windows\Fonts\times.ttf"
    ]
    font_sub = None
    for p in sub_font_paths:
        if os.path.exists(p):
            font_sub = ImageFont.truetype(p, 60)  # Aumentado a 60 para que sea bien visible
            break
    if not font_sub:
        font_sub = ImageFont.load_default()

    color = (255, 255, 255, 255)
    
    # Mediciones para centrado
    bbox_main = d.textbbox((0,0), name_text, font=font_main)
    bbox_sub = d.textbbox((0,0), sub_text, font=font_sub)
    
    w_main = bbox_main[2] - bbox_main[0]
    h_main = bbox_main[3] - bbox_main[1]
    
    w_sub = bbox_sub[2] - bbox_sub[0]
    h_sub = bbox_sub[3] - bbox_sub[1]
    
    y_main = height//2 - h_main
    x_main = width//2 - w_main//2
    
    # Subtítulo FOTOGRAFÍA
    y_sub = height//2 + 45
    x_sub = width//2 - w_sub//2
    
    # Sombra para máxima legibilidad
    d.text((x_main+3, y_main+3), name_text, font=font_main, fill=(0,0,0,200))
    d.text((x_sub+2, y_sub+2), sub_text, font=font_sub, fill=(0,0,0,200))
    
    # Texto Blanco
    d.text((x_main, y_main), name_text, font=font_main, fill=color)
    d.text((x_sub, y_sub), sub_text, font=font_sub, fill=color)
    
    # Una fina línea que separe de manera elegante a la mitad del camino
    line_y = height//2 + 25
    d.line([(width//2 - w_main//2 + 40, line_y), (width//2 + w_main//2 - 40, line_y)], fill=(255,255,255,120), width=4)
    
    # Recorte para que la aplicación calcule el tamaño perfectamente
    bbox = img.getbbox()
    if bbox:
        img = img.crop((max(0, bbox[0]-30), max(0, bbox[1]-30), min(width, bbox[2]+30), min(height, bbox[3]+30)))
    
    img.save(filename)
    print(f"Generada: {filename}")

create_signature("firma_opt4_cursiva.png", "Óscar López", "F O T O G R A F Í A")

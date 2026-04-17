@echo off
echo ========================================================
echo   Empaquetador Oficial - Miradas tras un Objetivo
echo ========================================================
echo.
echo Creando carpeta limpia de produccion...

if exist "web_lista_para_subir" rmdir /s /q "web_lista_para_subir"
mkdir "web_lista_para_subir"

echo Copiando archivos de codigo...
copy index.html web_lista_para_subir\ >nul
copy galeria.html web_lista_para_subir\ >nul
copy app.js web_lista_para_subir\ >nul
copy styles.css web_lista_para_subir\ >nul

echo Copiando arte y logotipos...
copy favicon.png web_lista_para_subir\ >nul
copy firma_opt4_cursiva.png web_lista_para_subir\ >nul

echo Copiando SEO para Google...
copy sitemap.xml web_lista_para_subir\ >nul
copy robots.txt web_lista_para_subir\ >nul

echo Copiando tu catalogo de fotos...
xcopy fotos web_lista_para_subir\fotos\ /E /I /C /H /Q >nul

echo.
echo ========================================================
echo MISION CUMPLIDA. 
echo La carpeta "web_lista_para_subir" acaba de aparecer en tu
echo escritorio. Entra en ella, y eso es TODO lo que tienes
echo que arrastrar al administrador /public_html de Hostinger.
echo ========================================================
echo.
pause

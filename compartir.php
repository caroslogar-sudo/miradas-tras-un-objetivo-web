<?php
/**
 * COMPARTIR.PHP - Puente dinámico para Facebook Open Graph
 * Este archivo permite que Facebook lea los metadatos de cada foto individualmente.
 */

// 1. Obtener el ID de la fotografía
$id = isset($_GET['id']) ? $_GET['id'] : '';

if (!$id) {
    header("Location: index.html");
    exit;
}

// 2. Configuración de Supabase (Lectura pública)
$supabaseUrl = 'https://ofwzeenfdeimuwvhvpht.supabase.co';
$supabaseKey = 'sb_publishable_Z-mfgQPG9ikmn_0wGQsCtQ_9feQU4Ue';

// 3. Consultar datos de la obra mediante cURL (API REST de Supabase)
$apiUrl = $supabaseUrl . '/rest/v1/fotografias?id=eq.' . $id . '&select=titulo,url';

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "apikey: " . $supabaseKey,
    "Authorization: Bearer " . $supabaseKey
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$titulo = "Miradas tras un Objetivo";
$imageUrl = "https://oscarlopezfotografias.com/portada_facebook.png"; // Fallback

if ($httpCode == 200) {
    $data = json_decode($response, true);
    if (!empty($data)) {
        $foto = $data[0];
        $titulo = $foto['titulo'];
        $urlOriginal = $foto['url'];
        
        // Normalizar URL de imagen
        if (strpos($urlOriginal, 'http') !== 0) {
            $imageUrl = "https://oscarlopezfotografias.com/" . (strpos($urlOriginal, 'fotos/') === 0 ? "" : "fotos/") . $urlOriginal;
        } else {
            $imageUrl = $urlOriginal;
        }
        
        // NOTA SOBRE TAMAÑO: Facebook ya redimensiona la imagen para la previsualización.
        // Al compartir el enlace de Supabase directamente en og:image, FB genera su propia miniatura.
    }
}

// 4. Generar el HTML con los Meta Tags para el crawler de Facebook
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title><?php echo htmlspecialchars($titulo); ?> | Óscar López Fotografía</title>
    
    <!-- Metadatos Open Graph para Facebook/WhatsApp -->
    <meta property="og:title" content="<?php echo htmlspecialchars($titulo); ?> | Óscar López">
    <meta property="og:description" content="Descubre esta obra exclusiva en la exposición virtual 'Miradas tras un Objetivo'. Edición limitada.">
    <meta property="og:image" content="<?php echo htmlspecialchars($imageUrl); ?>">
    <meta property="og:url" content="https://oscarlopezfotografias.com/compartir.php?id=<?php echo $id; ?>">
    <meta property="og:type" content="article">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <!-- Redirección inmediata para el usuario real -->
    <script>
        window.location.href = "index.html#<?php echo $id; ?>";
    </script>
    
    <style>
        body { background: #000; color: #c5a059; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .loader { text-align: center; }
    </style>
</head>
<body>
    <div class="loader">
        <p>Cargando obra artística...</p>
    </div>
</body>
</html>

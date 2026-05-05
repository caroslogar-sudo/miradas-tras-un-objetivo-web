<?php
/**
 * COMPARTIR.PHP - RECTIFICADO V2
 * Gestión de miniaturas (600px) y metadatos dinámicos.
 */

$id = isset($_GET['id']) ? $_GET['id'] : '';
if (!$id) {
    header("Location: index.html");
    exit;
}

// Configuración Supabase
$supabaseUrl = 'https://ofwzeenfdeimuwvhvpht.supabase.co';
$supabaseKey = 'sb_publishable_Z-mfgQPG9ikmn_0wGQsCtQ_9feQU4Ue';

// Consultar datos de la obra
$apiUrl = $supabaseUrl . '/rest/v1/fotografias?id=eq.' . $id . '&select=titulo,url,tematica';

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
$imageUrl = "https://oscarlopezfotografias.com/portada_facebook.png";
$descripcion = "Edición artística exclusiva limitada a 15 copias.";

if ($httpCode == 200) {
    $data = json_decode($response, true);
    if (!empty($data)) {
        $foto = $data[0];
        $titulo = $foto['titulo'];
        $urlOriginal = $foto['url'];
        
        // 1. CONSTRUCCIÓN DE URL DE MINIATURA (Protección y Optimización)
        // Intentamos usar el renderizador de Supabase para obtener una versión de 600px
        if (strpos($urlOriginal, 'http') === 0) {
            // Si ya es una URL de Supabase, le inyectamos el parámetro de transformación
            // Nota: Esto requiere que Supabase tenga habilitado el Image Transformation (estándar en Pro)
            // Si no, usará la original pero FB la mostrará como miniatura.
            $imageUrl = str_replace('/object/public/', '/render/image/public/', $urlOriginal) . "?width=600&resize=contain";
        } else {
            // Si es una ruta relativa
            $path = (strpos($urlOriginal, 'fotos/') === 0 ? "" : "fotos/") . $urlOriginal;
            $imageUrl = "https://oscarlopezfotografias.com/" . $path;
        }
    }
}

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title><?php echo htmlspecialchars($titulo); ?> | Óscar López</title>
    
    <!-- METADATOS CRÍTICOS PARA FACEBOOK -->
    <meta property="og:site_name" content="Óscar López Fotografía">
    <meta property="og:title" content="<?php echo htmlspecialchars($titulo); ?> | Obra Exclusiva">
    <meta property="og:description" content="<?php echo htmlspecialchars($descripcion); ?>">
    <meta property="og:image" content="<?php echo htmlspecialchars($imageUrl); ?>">
    <meta property="og:image:secure_url" content="<?php echo htmlspecialchars($imageUrl); ?>">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="600">
    <meta property="og:image:height" content="400">
    <meta property="og:url" content="https://oscarlopezfotografias.com/compartir.php?id=<?php echo $id; ?>">
    <meta property="og:type" content="article">

    <!-- Redirección para el usuario -->
    <script>
        window.location.href = "index.html#<?php echo $id; ?>";
    </script>
</head>
<body style="background:#000; color:#fff; display:flex; align-items:center; justify-content:center; height:100vh;">
    <div style="text-align:center;">
        <p>Entrando en la obra: <strong><?php echo htmlspecialchars($titulo); ?></strong></p>
    </div>
</body>
</html>

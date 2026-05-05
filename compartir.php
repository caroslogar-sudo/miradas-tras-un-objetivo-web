<?php
/**
 * COMPARTIR.PHP - RECTIFICADO V3 (HOSTINGER NATIVO)
 * Asegura que Facebook encuentre la foto en la carpeta local /fotos/
 */

$id = isset($_GET['f']) ? $_GET['f'] : '';
if (!$id) {
    header("Location: index.html");
    exit;
}

// Configuración Supabase (Solo para obtener el título y el nombre del archivo)
$supabaseUrl = 'https://ofwzeenfdeimuwvhvpht.supabase.co';
$supabaseKey = 'sb_publishable_Z-mfgQPG9ikmn_0wGQsCtQ_9feQU4Ue';

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
        $urlOriginal = trim($foto['url']);
        
        // CONSTRUCCIÓN DE URL PARA HOSTINGER
        if (strpos($urlOriginal, 'http') === 0) {
            $imageUrl = $urlOriginal;
        } else {
            // Limpiamos el nombre del archivo (quitamos 'fotos/' si ya lo trae)
            $fileName = str_replace('fotos/', '', $urlOriginal);
            // Codificamos los espacios para que la URL sea válida (ej: 'foto 1.jpg' -> 'foto%201.jpg')
            $encodedFile = str_replace(' ', '%20', $fileName);
            $imageUrl = "https://oscarlopezfotografias.com/fotos/" . $encodedFile;
        }
    }
}

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title><?php echo htmlspecialchars($titulo); ?> | Óscar López</title>
    
    <!-- ETIQUETAS OPEN GRAPH DEFINITIVAS -->
    <meta property="og:site_name" content="Óscar López Fotografía">
    <meta property="og:title" content="<?php echo htmlspecialchars($titulo); ?> | Miradas tras un Objetivo">
    <meta property="og:description" content="Exposición Virtual: Edición limitada exclusiva de 15 copias.">
    <meta property="og:image" content="<?php echo htmlspecialchars($imageUrl); ?>">
    <meta property="og:image:secure_url" content="<?php echo htmlspecialchars($imageUrl); ?>">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:url" content="https://oscarlopezfotografias.com/compartir.php?f=<?php echo $id; ?>">
    <meta property="og:type" content="article">

    <!-- Redirección para el usuario -->
    <script>
        window.location.href = "index.html#<?php echo $id; ?>";
    </script>
</head>
<body style="background:#000; color:#c5a059; display:flex; align-items:center; justify-content:center; height:100vh; font-family:serif;">
    <div style="text-align:center;">
        <p>Cargando obra: <strong><?php echo htmlspecialchars($titulo); ?></strong></p>
    </div>
</body>
</html>

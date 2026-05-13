<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'conexion.php';

$documento_id = isset($_POST['documento_id']) ? intval($_POST['documento_id']) : 0;

if ($documento_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID de documento requerido']);
    exit;
}

try {
    $uploadDir = 'uploads_firmados/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $archivoFirmado = null;

    if (isset($_FILES['signed_file']) && $_FILES['signed_file']['error'] === UPLOAD_ERR_OK) {
        $nombreArchivo = 'firmado_' . $documento_id . '_' . uniqid() . '.pdf';
        $rutaArchivo = $uploadDir . $nombreArchivo;
        move_uploaded_file($_FILES['signed_file']['tmp_name'], $rutaArchivo);
        $archivoFirmado = $rutaArchivo;
    }

    if ($archivoFirmado) {
        $stmt = $conn->prepare("UPDATE documentos SET archivo_firmado = ?, estado = 'firmado', fecha_actualizacion = NOW() WHERE id = ?");
        $stmt->bind_param("si", $archivoFirmado, $documento_id);
        $stmt->execute();
        $stmt->close();
    }

    echo json_encode([
        'success' => true,
        'message' => 'Documento firmado recibido correctamente',
        'archivo' => $archivoFirmado
    ]);

    $conn->close();
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
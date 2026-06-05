<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

include 'conexion.php';

// Recibir datos del frontend (FormData)
$nombre = isset($_POST['nombre']) ? $_POST['nombre'] : '';
$numero_informe = isset($_POST['numero_informe']) ? $_POST['numero_informe'] : '';
$usuario_id = isset($_POST['usuario_id']) ? intval($_POST['usuario_id']) : 0;
$area_origen = isset($_POST['area_origen']) ? intval($_POST['area_origen']) : 0;
$area_destino = isset($_POST['area_destino']) ? intval($_POST['area_destino']) : 0;

// Validar datos obligatorios
if (empty($nombre) || $usuario_id <= 0 || $area_origen <= 0 || $area_destino <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Faltan datos obligatorios'
    ]);
    exit;
}

// Verificar que se haya enviado un archivo
if (!isset($_FILES['archivo']) || $_FILES['archivo']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al subir el archivo'
    ]);
    exit;
}

// Validar que sea PDF
$archivo = $_FILES['archivo'];
if ($archivo['type'] !== 'application/pdf') {
    echo json_encode([
        'success' => false,
        'message' => 'Solo se permiten archivos PDF'
    ]);
    exit;
}

// Crear directorio de uploads si no existe
$uploadDir = 'uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

<<<<<<< Updated upstream
// Generar nombre único para el archivo
$nombreArchivo = uniqid() . '_' . basename($archivo['name']);
$rutaArchivo = $uploadDir . $nombreArchivo;

// Mover el archivo
if (!move_uploaded_file($archivo['tmp_name'], $rutaArchivo)) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al guardar el archivo'
=======
$nombreArchivo = uniqid() . '.pdf';
$rutaArchivo = $uploadDir . $nombreArchivo;

if (!move_uploaded_file($archivo['tmp_name'], $rutaArchivo)) {

    echo json_encode([
        'success' => false,
        'message' => 'Error al guardar archivo'
>>>>>>> Stashed changes
    ]);
    exit;
}

// Insertar en la base de datos
try {
    $stmt = $conn->prepare("
        INSERT INTO documentos (nombre, numero_informe, archivo, usuario_id, area_origen_id, area_destino_id, estado, fecha_subida, fecha_actualizacion)
        VALUES (?, ?, ?, ?, ?, ?, 'enviado', NOW(), NOW())
    ");

    $stmt->bind_param("sssiii", $nombre, $numero_informe, $rutaArchivo, $usuario_id, $area_origen_id, $area_destino_id);

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Documento subido correctamente',
            'id' => $conn->insert_id
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al guardar en la base de datos: ' . $stmt->error
        ]);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
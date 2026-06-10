<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

include 'conexion.php';

// Recibir datos del frontend
$id = isset($_POST['id']) ? intval($_POST['id']) : 0;
$usuario_id = isset($_POST['usuario_id']) ? intval($_POST['usuario_id']) : 0;

// Validar datos obligatorios
if ($id <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'ID de documento es obligatorio'
    ]);
    exit;
}

// Verificar que el documento esté en estado 'observado'
$stmtCheck = $conn->prepare("SELECT id, estado FROM documentos WHERE id = ?");
$stmtCheck->bind_param("i", $id);
$stmtCheck->execute();
$result = $stmtCheck->get_result();
$doc = $result->fetch_assoc();
$stmtCheck->close();

if (!$doc) {
    echo json_encode([
        'success' => false,
        'message' => 'Documento no encontrado'
    ]);
    exit;
}

if ($doc['estado'] !== 'observado') {
    echo json_encode([
        'success' => false,
        'message' => 'Solo se pueden subsanar documentos en estado observado'
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

$nombreArchivo = uniqid() . '_subsanado.pdf';
$rutaArchivo = $uploadDir . $nombreArchivo;

if (!move_uploaded_file($archivo['tmp_name'], $rutaArchivo)) {

    echo json_encode([
        'success' => false,
        'message' => 'Error al guardar archivo'
    ]);

    exit;
}

try {
    // Obtener el estado actual del documento
    $estado_anterior = $doc['estado'];

    // Actualizar el documento: cambiar estado a 'enviado' y actualizar el archivo
    $stmt = $conn->prepare("UPDATE documentos SET estado = 'enviado', archivo = ?, comentario = NULL, fecha_actualizacion = NOW() WHERE id = ?");
    $stmt->bind_param("si", $rutaArchivo, $id);

    if ($stmt->execute()) {
        // Registrar en el historial
        $estado_nuevo = 'enviado';
        $comentario_historial = 'Documento subsanado';
        $stmtHistorial = $conn->prepare("
INSERT INTO seguimiento_documento (documento_id, area_id, estado, comentario, fecha) 
VALUES (?, ?, ?, ?, NOW())
");

$estado_nuevo = 'enviado';
$comentario_historial = 'Documento subsanado';

$stmtHistorial->bind_param("iiss", $id, $usuario_id, $estado_nuevo, $comentario_historial);
        $stmtHistorial->execute();
        $stmtHistorial->close();

        echo json_encode([
            'success' => true,
            'message' => 'Documento subsanado correctamente',
            'archivo' => $rutaArchivo
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar el documento: ' . $stmt->error
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
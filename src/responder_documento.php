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

// Verificar que el documento exista
$stmtCheck = $conn->prepare("SELECT id, estado, area_origen_id FROM documentos WHERE id = ?");
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

// Generar nombre único para el archivo
$nombreArchivo = uniqid() . '_' . basename($archivo['name']);
$rutaArchivo = $uploadDir . $nombreArchivo;

// Mover el archivo
if (!move_uploaded_file($archivo['tmp_name'], $rutaArchivo)) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al guardar el archivo'
    ]);
    exit;
}

<<<<<<< Updated upstream
try {
    // Actualizar el documento (similar a subsanar):
    // - estado cambia a 'finalizado'
    // - archivo se actualiza con el nuevo PDF de respuesta
    // - comentario se limpia
    // - area_origen_id y area_destino_id se mantienen (el documento sigue vinculado al origen original)
=======
$tempPath = $tempOriginal;

try {

    // Crear PDF unido
    $pdf = new Fpdi();

    // =========================
    // 1. PDF RESPUESTA
    // =========================

    $pageCountRespuesta = $pdf->setSourceFile($tempPath);

    for ($i = 1; $i <= $pageCountRespuesta; $i++) {

        $tpl = $pdf->importPage($i);

        $size = $pdf->getTemplateSize($tpl);

        $pdf->AddPage(
            $size['orientation'],
            [$size['width'], $size['height']]
        );

        $pdf->useTemplate($tpl);
    }

    // =========================
    // 2. PDF ORIGINAL
    // =========================
    $rutaOriginal = $doc['archivo'];

    if ($rutaOriginal && file_exists($rutaOriginal)) {

        $pageCount = $pdf->setSourceFile($rutaOriginal);

        for ($i = 1; $i <= $pageCount; $i++) {

            $tpl = $pdf->importPage($i);

            $size = $pdf->getTemplateSize($tpl);

            $pdf->AddPage(
                $size['orientation'],
                [$size['width'], $size['height']]
            );

            $pdf->useTemplate($tpl);
        }
    }

    // =========================
    // Guardar PDF final
    // =========================
    $nombreFinal = uniqid() . '_respuesta_unida.pdf';
    $rutaFinal = 'uploads/' . $nombreFinal;

    $pdf->Output('F', $rutaFinal);

    // Borrar temporal
    if (file_exists($tempPath)) {
        unlink($tempPath);
    }

    // =========================
    // ACTUALIZAR DOCUMENTO
    // =========================
    $estado = 'pendiente_evaluacion';

    $areaOrigenActual = $doc['area_origen_id'];
    $areaDestinoActual = $doc['area_destino_id'];

>>>>>>> Stashed changes
    $stmt = $conn->prepare("
        UPDATE documentos
        SET
            estado = 'finalizado',
            archivo = ?,
            comentario = NULL,
            fecha_actualizacion = NOW()
        WHERE id = ?
    ");

    $stmt->bind_param("si", $rutaArchivo, $id);

    if ($stmt->execute()) {
        // Registrar en el historial
        $estado_nuevo = 'finalizado';
        $comentario_historial = 'Documento respondido';
        $stmtHistorial = $conn->prepare("
            INSERT INTO seguimiento_documento (documento_id, area_id, estado, comentario, fecha)
            VALUES (?, ?, ?, ?, NOW())
        ");
        $stmtHistorial->bind_param("iiss", $id, $usuario_id, $estado_nuevo, $comentario_historial);
        $stmtHistorial->execute();
        $stmtHistorial->close();

        echo json_encode([
            'success' => true,
            'message' => 'Documento respondido y finalizado correctamente',
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
<<<<<<< Updated upstream
=======

    // Limpiar temporal
    if (file_exists($tempPath)) {
        unlink($tempPath);
    }

>>>>>>> Stashed changes
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>

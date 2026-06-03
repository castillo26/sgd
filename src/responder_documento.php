<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once __DIR__ . '/vendor/autoload.php';

use setasign\Fpdi\Fpdi;

include 'conexion.php';

// Recibir datos
$id = isset($_POST['id']) ? intval($_POST['id']) : 0;
$usuario_id = isset($_POST['usuario_id']) ? intval($_POST['usuario_id']) : 0;
$nombre = isset($_POST['nombre']) ? $_POST['nombre'] : '';
$numero_informe = isset($_POST['numero_informe']) ? $_POST['numero_informe'] : '';

if ($id <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'ID inválido'
    ]);
    exit;
}

// Buscar documento original
$stmtCheck = $conn->prepare("
    SELECT id, archivo, area_origen_id, area_destino_id
    FROM documentos
    WHERE id = ?
");

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

// Validar archivo PDF
if (!isset($_FILES['archivo'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Debe adjuntar un PDF'
    ]);
    exit;
}

$archivo = $_FILES['archivo'];

if ($archivo['error'] !== 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al subir archivo'
    ]);
    exit;
}

if ($archivo['type'] !== 'application/pdf') {
    echo json_encode([
        'success' => false,
        'message' => 'Solo se permiten PDFs'
    ]);
    exit;
}

// Crear carpetas
if (!is_dir('uploads')) {
    mkdir('uploads', 0777, true);
}

if (!is_dir('uploads/temp')) {
    mkdir('uploads/temp', 0777, true);
}

// ========================================
// GUARDAR PDF TEMPORAL
// ========================================

$tempName = uniqid() . '_respuesta_temp.pdf';
$tempOriginal = 'uploads/temp/' . $tempName;

if (!move_uploaded_file($archivo['tmp_name'], $tempOriginal)) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al guardar archivo temporal'
    ]);
    exit;
}

// ========================================
// CONVERTIR PDF A VERSION COMPATIBLE FPDI
// ========================================

$tempCompatible = 'uploads/temp/' . uniqid() . '_compatible.pdf';

// Ruta completa de Ghostscript
$gsPath = '"C:\\Program Files (x86)\\gs\\gs10.07.1\\bin\\gswin32c.exe"';

$gsCommand = $gsPath
    . ' -sDEVICE=pdfwrite'
    . ' -dCompatibilityLevel=1.4'
    . ' -dNOPAUSE'
    . ' -dQUIET'
    . ' -dBATCH'
    . ' -sOutputFile="' . $tempCompatible . '"'
    . ' "' . $tempOriginal . '"';

exec($gsCommand, $output, $returnVar);

// Si la conversión funciona, usar PDF compatible
if ($returnVar === 0 && file_exists($tempCompatible)) {

    // borrar original temporal
    unlink($tempOriginal);

    $tempPath = $tempCompatible;

} else {

    // usar original si falla Ghostscript
    $tempPath = $tempOriginal;
}

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

        $tempOriginalCompatible =
    'uploads/temp/' . uniqid() . '_original_compatible.pdf';

$gsCommand = $gsPath
    . ' -sDEVICE=pdfwrite'
    . ' -dCompatibilityLevel=1.4'
    . ' -dNOPAUSE'
    . ' -dQUIET'
    . ' -dBATCH'
    . ' -sOutputFile="' . $tempOriginalCompatible . '"'
    . ' "' . $rutaOriginal . '"';

exec($gsCommand, $output, $returnVar);

if (
    $returnVar === 0 &&
    file_exists($tempOriginalCompatible)
) {
    $rutaOriginal = $tempOriginalCompatible;
}

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

    $stmt = $conn->prepare("
        UPDATE documentos
        SET
            nombre = ?,
            numero_informe = ?,
            estado = 'pendiente_evaluacion',
            archivo = ?,
            area_origen_id = ?,
            area_destino_id = ?,
            comentario = NULL,
            fecha_actualizacion = NOW()
        WHERE id = ?
    ");

    $stmt->bind_param(
        "sssiii",
        $nombre,
        $numero_informe,
        $rutaFinal,
        $areaDestinoActual, // nuevo origen
        $areaOrigenActual,  // nuevo destino
        $id
    );

    if ($stmt->execute()) {

        // Registrar historial
        $comentario = 'Documento respondido y enviado para evaluación';

        $stmtHistorial = $conn->prepare("
            INSERT INTO seguimiento_documento
            (documento_id, area_id, estado, comentario)
            VALUES (?, ?, ?, ?)
        ");

        $stmtHistorial->bind_param(
            "iiss",
            $id,
            $doc['area_origen_id'],
            $estado,
            $comentario
        );

        $stmtHistorial->execute();
        $stmtHistorial->close();

        echo json_encode([
            'success' => true,
            'message' => 'Documento respondido correctamente',
            'archivo' => $rutaFinal
        ]);

    } else {

        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar documento'
        ]);
    }

    $stmt->close();

} catch (Exception $e) {

    if (
    isset($tempOriginalCompatible) &&
    file_exists($tempOriginalCompatible)
) {
    unlink($tempOriginalCompatible);
}

    // Limpiar temporal
    if (file_exists($tempPath)) {
        unlink($tempPath);
    }

    echo json_encode([
        'success' => false,
        'message' => 'Error FPDI: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
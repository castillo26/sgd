<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once __DIR__ . '/vendor/autoload.php';

use setasign\Fpdi\Fpdi;

include 'conexion.php';

// Recibir datos del frontend
$id = isset($_POST['id']) ? intval($_POST['id']) : 0;
$estado = isset($_POST['estado']) ? $_POST['estado'] : '';
$comentario = isset($_POST['comentario']) ? $_POST['comentario'] : '';
$area_destino = isset($_POST['area_destino']) ? intval($_POST['area_destino']) : 0;
$usuario_id = isset($_POST['usuario_id']) ? intval($_POST['usuario_id']) : 0;
$pdfAdjuntoExiste =
    isset($_FILES['pdf_adjunto']) &&
    $_FILES['pdf_adjunto']['error'] === UPLOAD_ERR_OK;

// Validaciones
if ($id <= 0 || empty($estado)) {
    echo json_encode([
        'success' => false,
        'message' => 'ID y estado son obligatorios'
    ]);
    exit;
}

if ($estado === 'observado' && empty(trim($comentario))) {
    echo json_encode([
        'success' => false,
        'message' => 'La observación es obligatoria'
    ]);
    exit;
}

try {

    $fechaAceptacion = null;

    // 🔧 LÓGICA SEGÚN ESTADO
    if ($estado === 'observado') {

        $stmt = $conn->prepare("
            UPDATE documentos 
            SET estado = ?, comentario = ?, fecha_actualizacion = NOW() 
            WHERE id = ?
        ");
        $stmt->bind_param("ssi", $estado, $comentario, $id);

    } elseif ($estado === 'derivado') {

    $rutaFinal = null;

    // ===================================================
    // SI HAY PDF ADJUNTO → UNIRLO CON EL ORIGINAL
    // ===================================================

    if ($pdfAdjuntoExiste) {

        $stmtDoc = $conn->prepare("
            SELECT archivo
            FROM documentos
            WHERE id = ?
        ");

        $stmtDoc->bind_param("i", $id);
        $stmtDoc->execute();

        $docResult = $stmtDoc->get_result();
        $documento = $docResult->fetch_assoc();

        $stmtDoc->close();

        if ($documento && file_exists($documento['archivo'])) {

            if (!is_dir('uploads/temp')) {
                mkdir('uploads/temp', 0777, true);
            }

            $tempAdjunto =
                'uploads/temp/' .
                uniqid() .
                '_adjunto.pdf';

            move_uploaded_file(
                $_FILES['pdf_adjunto']['tmp_name'],
                $tempAdjunto
            );

            $gsPath =
                '"C:\\Program Files (x86)\\gs\\gs10.07.1\\bin\\gswin32c.exe"';

            // ==========================================
// CONVERTIR ADJUNTO A PDF COMPATIBLE
// ==========================================

$adjuntoCompatible =
    'uploads/temp/' .
    uniqid() .
    '_adjunto_compatible.pdf';

$cmd =
    $gsPath .
    ' -sDEVICE=pdfwrite' .
    ' -dCompatibilityLevel=1.4' .
    ' -dNOPAUSE' .
    ' -dQUIET' .
    ' -dBATCH' .
    ' -sOutputFile="' .
    $adjuntoCompatible .
    '" "' .
    $tempAdjunto .
    '"';

exec($cmd, $out, $ret);

if (
    $ret === 0 &&
    file_exists($adjuntoCompatible) &&
    filesize($adjuntoCompatible) > 0
) {

    unlink($tempAdjunto);

    $tempAdjunto = $adjuntoCompatible;

} else {

    throw new Exception(
        'Ghostscript no pudo convertir el PDF adjunto'
    );
}

            // PDF original compatible

            $rutaOriginal = $documento['archivo'];

            $originalCompatible =
                'uploads/temp/' .
                uniqid() .
                '_original_compatible.pdf';

            $cmd =
                $gsPath .
                ' -sDEVICE=pdfwrite' .
                ' -dCompatibilityLevel=1.4' .
                ' -dNOPAUSE' .
                ' -dQUIET' .
                ' -dBATCH' .
                ' -sOutputFile="' .
                $originalCompatible .
                '" "' .
                $rutaOriginal .
                '"';

            exec($cmd, $out, $ret);

if (
    $ret === 0 &&
    file_exists($originalCompatible) &&
    filesize($originalCompatible) > 0
) {

    $rutaOriginal = $originalCompatible;

} else {

    throw new Exception(
        'Ghostscript no pudo convertir el PDF original'
    );
}

            if (!file_exists($tempAdjunto)) {
    throw new Exception(
        'No existe adjunto convertido: ' .
        $tempAdjunto
    );
}

if (!file_exists($rutaOriginal)) {
    throw new Exception(
        'No existe original convertido: ' .
        $rutaOriginal
    );
}

            // ==================================
            // UNIR PDFs
            // ==================================

            $pdf = new Fpdi();

            // PDF ADJUNTO PRIMERO

            if (!file_exists($tempAdjunto)) {
    throw new Exception(
        "No existe PDF adjunto convertido"
    );
}

if (filesize($tempAdjunto) <= 0) {
    throw new Exception(
        "PDF adjunto vacío"
    );
}

            $pages =
                $pdf->setSourceFile($tempAdjunto);

            for ($i = 1; $i <= $pages; $i++) {

                $tpl = $pdf->importPage($i);

                $size =
                    $pdf->getTemplateSize($tpl);

                $pdf->AddPage(
                    $size['orientation'],
                    [$size['width'], $size['height']]
                );

                $pdf->useTemplate($tpl);
            }

            // PDF ORIGINAL DESPUÉS

            if (!file_exists($rutaOriginal)) {
    throw new Exception(
        "No existe PDF original"
    );
}

if (filesize($rutaOriginal) <= 0) {
    throw new Exception(
        "PDF original vacío"
    );
}

            $pages =
                $pdf->setSourceFile($rutaOriginal);

            for ($i = 1; $i <= $pages; $i++) {

                $tpl = $pdf->importPage($i);

                $size =
                    $pdf->getTemplateSize($tpl);

                $pdf->AddPage(
                    $size['orientation'],
                    [$size['width'], $size['height']]
                );

                $pdf->useTemplate($tpl);
            }

            $rutaFinal =
                'uploads/' .
                uniqid() .
                '_derivado.pdf';

            $pdf->Output('F', $rutaFinal);

            if (file_exists($tempAdjunto)) {
                unlink($tempAdjunto);
            }

            if (file_exists($originalCompatible)) {
                unlink($originalCompatible);
            }
        }
    }

    if ($rutaFinal) {

        $stmt = $conn->prepare("
            UPDATE documentos
            SET estado = 'enviado',
                area_destino_id = ?,
                archivo = ?,
                comentario = NULL,
                fecha_actualizacion = NOW()
            WHERE id = ?
        ");

        $stmt->bind_param(
            "isi",
            $area_destino,
            $rutaFinal,
            $id
        );

    } else {

        $stmt = $conn->prepare("
            UPDATE documentos
            SET estado = 'enviado',
                area_destino_id = ?,
                comentario = NULL,
                fecha_actualizacion = NOW()
            WHERE id = ?
        ");

        $stmt->bind_param(
            "ii",
            $area_destino,
            $id
        );
    }

    } elseif ($estado === 'recibido') {

        // 🔥 Generamos fecha para devolver al frontend
        $fechaAceptacion = date('Y-m-d H:i:s');

        if (!empty(trim($comentario))) {
            $stmt = $conn->prepare("
                UPDATE documentos 
                SET estado = ?, comentario = ?, fecha_aceptacion = ?, fecha_actualizacion = NOW() 
                WHERE id = ?
            ");
            $stmt->bind_param("sssi", $estado, $comentario, $fechaAceptacion, $id);
        } else {
            $stmt = $conn->prepare("
                UPDATE documentos 
                SET estado = ?, fecha_aceptacion = ?, fecha_actualizacion = NOW() 
                WHERE id = ?
            ");
            $stmt->bind_param("ssi", $estado, $fechaAceptacion, $id);
        }

    } elseif ($estado === 'finalizado') {

        if (!empty(trim($comentario))) {
            $stmt = $conn->prepare("
                UPDATE documentos 
                SET estado = ?, comentario = ?, fecha_actualizacion = NOW() 
                WHERE id = ?
            ");
            $stmt->bind_param("ssi", $estado, $comentario, $id);
        } else {
            $stmt = $conn->prepare("
                UPDATE documentos 
                SET estado = ?, fecha_actualizacion = NOW() 
                WHERE id = ?
            ");
            $stmt->bind_param("si", $estado, $id);
        }

    } else {

        $stmt = $conn->prepare("
            UPDATE documentos 
            SET estado = ?, fecha_actualizacion = NOW() 
            WHERE id = ?
        ");
        $stmt->bind_param("si", $estado, $id);
    }

    // Ejecutar actualización
    if ($stmt->execute()) {

        // 🧾 Guardar historial
        $stmtHistorial = $conn->prepare("
            INSERT INTO seguimiento_documento 
            (documento_id, area_id, estado, comentario, fecha) 
            VALUES (?, ?, ?, ?, NOW())
        ");
        $stmtHistorial->bind_param("iiss", $id, $area_destino, $estado, $comentario);
        $stmtHistorial->execute();
        $stmtHistorial->close();

        // ✅ RESPUESTA MEJORADA
        echo json_encode([
            'success' => true,
            'message' => 'Estado actualizado correctamente',
            'comentario' => $comentario,
            'fecha_aceptacion' => $fechaAceptacion // 🔥 clave
        ]);

    } else {

        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar: ' . $stmt->error
        ]);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {

    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'tempAdjunto' => $tempAdjunto ?? null,
        'rutaOriginal' => $rutaOriginal ?? null,
        'ret' => $ret ?? null
    ]);

    exit;
}
?>
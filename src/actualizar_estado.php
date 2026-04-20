<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

include 'conexion.php';

// Recibir datos del frontend
$id = isset($_POST['id']) ? intval($_POST['id']) : 0;
$estado = isset($_POST['estado']) ? $_POST['estado'] : '';
$comentario = isset($_POST['comentario']) ? $_POST['comentario'] : '';
$area_destino = isset($_POST['area_destino']) ? intval($_POST['area_destino']) : 0;
$usuario_id = isset($_POST['usuario_id']) ? intval($_POST['usuario_id']) : 0;

// Validar datos obligatorios
if ($id <= 0 || empty($estado)) {
    echo json_encode([
        'success' => false,
        'message' => 'ID y estado son obligatorios'
    ]);
    exit;
}

// Si el estado es 'observado', la observación es obligatoria
if ($estado === 'observado' && empty(trim($comentario))) {
    echo json_encode([
        'success' => false,
        'message' => 'La observación es obligatoria para documentos observados'
    ]);
    exit;
}

try {
    // Obtener el estado actual del documento
    $stmtEstado = $conn->prepare("SELECT estado FROM documentos WHERE id = ?");
    $stmtEstado->bind_param("i", $id);
    $stmtEstado->execute();
    $resultEstado = $stmtEstado->get_result();
    $docActual = $resultEstado->fetch_assoc();
    $estado_anterior = $docActual ? $docActual['estado'] : '';
    $stmtEstado->close();

    // Preparar la consulta según el estado
    if ($estado === 'observado') {
        // Cuando se observa, se actualiza el estado y se guarda la observación
        // El documento permanece visible para ambas partes
        $stmt = $conn->prepare("UPDATE documentos SET estado = ?, comentario = ?, fecha_actualizacion = NOW() WHERE id = ?");
        $stmt->bind_param("ssi", $estado, $comentario, $id);
    } elseif ($estado === 'derivado') {
        // Cuando se deriva, se cambia el área destino y el estado pasa a 'enviado'
        // Se limpia la observación anterior
        $stmt = $conn->prepare("UPDATE documentos SET estado = 'enviado', area_destino = ?, comentario = NULL, fecha_actualizacion = NOW() WHERE id = ?");
        $stmt->bind_param("ii", $area_destino, $id);
    } elseif ($estado === 'recibido') {
        // Cuando se acepta, se guarda el comentario como observación (si existe)
        // y se registra la fecha de aceptación
        if (!empty(trim($comentario))) {
            $stmt = $conn->prepare("UPDATE documentos SET estado = ?, comentario = ?, fecha_aceptacion = NOW(), fecha_actualizacion = NOW() WHERE id = ?");
            $stmt->bind_param("ssi", $estado, $comentario, $id);
        } else {
            $stmt = $conn->prepare("UPDATE documentos SET estado = ?, fecha_aceptacion = NOW(), fecha_actualizacion = NOW() WHERE id = ?");
            $stmt->bind_param("si", $estado, $id);
        }
    }/*  elseif ($estado === 'subsanado') {
        // Cuando se subsana un documento observado, se actualiza el archivo y el estado
        $archivo = isset($_POST['archivo']) ? $_POST['archivo'] : '';
        if (empty($archivo)) {
            echo json_encode([
                'success' => false,
                'message' => 'El archivo es obligatorio para subsanar'
            ]);
            exit;
        }
        $stmt = $conn->prepare("UPDATE documentos SET estado = 'enviado', archivo = ?, comentario = NULL, fecha_actualizacion = NOW() WHERE id = ?");
        $stmt->bind_param("si", $archivo, $id);
    } */ elseif ($estado === 'finalizado') {
        // Cuando se finaliza, se puede guardar un comentario final
        if (!empty(trim($comentario))) {
            $stmt = $conn->prepare("UPDATE documentos SET estado = ?, comentario = ?, fecha_actualizacion = NOW() WHERE id = ?");
            $stmt->bind_param("ssi", $estado, $comentario, $id);
        } else {
            $stmt = $conn->prepare("UPDATE documentos SET estado = ?, fecha_actualizacion = NOW() WHERE id = ?");
            $stmt->bind_param("si", $estado, $id);
        }
    } else {
        // Otros estados (en proceso)
        $stmt = $conn->prepare("UPDATE documentos SET estado = ?, fecha_actualizacion = NOW() WHERE id = ?");
        $stmt->bind_param("si", $estado, $id);
    }

    if ($stmt->execute()) {
        // Registrar en el historial
        $stmtHistorial = $conn->prepare("
INSERT INTO seguimiento_documento (documento_id, area_id, estado, comentario, fecha) 
VALUES (?, ?, ?, ?, NOW())
");

$stmtHistorial->bind_param("iiss", $id, $area_destino, $estado, $comentario);
        $stmtHistorial->execute();
        $stmtHistorial->close();

        echo json_encode([
            'success' => true,
            'message' => 'Estado actualizado correctamente',
            'comentario' => $comentario
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar el estado: ' . $stmt->error
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
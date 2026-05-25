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

        $stmt = $conn->prepare("
            UPDATE documentos 
            SET estado = 'enviado', area_destino_id = ?, comentario = NULL, fecha_actualizacion = NOW() 
            WHERE id = ?
        ");
        $stmt->bind_param("ii", $area_destino, $id);

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
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
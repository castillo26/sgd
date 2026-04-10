<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

include 'conexion.php';

// Recibir el ID del usuario administrador
$usuario_id = isset($_GET['usuario_id']) ? intval($_GET['usuario_id']) : 0;

if ($usuario_id <= 0) {
    echo json_encode([]);
    exit;
}

// Consultar documentos que el admin ha enviado (su seguimiento)
$stmt = $conn->prepare("
    SELECT d.id, d.nombre, d.numero_informe, d.archivo, d.estado, d.comentario,
           d.fecha_subida, d.fecha_actualizacion,
           ao.nombre_area as origen,
           ad.nombre_area as destino
    FROM documentos d
    LEFT JOIN areas ao ON d.area_origen_id = ao.id
    LEFT JOIN areas ad ON d.area_destino_id = ad.id
    WHERE d.usuario_id = ?
    ORDER BY d.fecha_subida DESC
");

$stmt->bind_param("i", $usuario_id);
$stmt->execute();
$result = $stmt->get_result();

$documentos = [];
while ($row = $result->fetch_assoc()) {
    $documentos[] = [
        'id' => $row['id'],
        'nombre' => $row['nombre'],
        'numero_informe' => $row['numero_informe'],
        'archivo' => $row['archivo'],
        'estado' => $row['estado'],
        'comentario' => $row['comentario'],
        'origen' => $row['origen'],
        'destino' => $row['destino'],
        'fecha_subida' => $row['fecha_subida'],
        'fecha_actualizacion' => $row['fecha_actualizacion']
    ];
}

echo json_encode($documentos);
$stmt->close();
$conn->close();
?>
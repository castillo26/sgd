<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

include 'conexion.php';

// Recibir el área
$area = isset($_GET['area']) ? intval($_GET['area']) : 0;

if ($area <= 0) {
    echo json_encode([]);
    exit;
}

// Consultar documentos finalizados del área con información de áreas y observación
$stmt = $conn->prepare("
    SELECT d.id, d.nombre, d.numero_informe, d.archivo, d.estado, d.comentario,
           d.fecha_subida, d.fecha_actualizacion, d.fecha_aceptacion,
           ao.nombre_area as origen,
           ad.nombre_area as destino
    FROM documentos d
    LEFT JOIN areas ao ON d.area_origen_id = ao.id
    LEFT JOIN areas ad ON d.area_destino_id = ad.id
    WHERE
(
    d.area_origen_id = ?
    OR
    d.area_destino_id = ?
)
AND d.estado = 'finalizado'
    ORDER BY d.fecha_subida DESC
");

$stmt->bind_param("ii", $area, $area);
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
        'fecha_actualizacion' => $row['fecha_actualizacion'],
        'fecha_aceptacion' => $row['fecha_aceptacion']
    ];
}

echo json_encode($documentos);
$stmt->close();
$conn->close();
?>
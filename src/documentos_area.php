<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require "conexion.php";

$area = isset($_GET['area']) ? intval($_GET['area']) : 0;

if ($area <= 0) {
    echo json_encode([]);
    exit;
}

/*
    Mostrar:

    1. Documentos recibidos por el área
    2. Documentos pendientes de evaluación
       donde el área actual es el origen
*/

$sql = "
SELECT 
    d.*,
    a1.nombre_area AS origen,
    a2.nombre_area AS destino

FROM documentos d

JOIN areas a1 ON d.area_origen_id = a1.id
JOIN areas a2 ON d.area_destino_id = a2.id

WHERE
(
    d.area_destino_id = ?
    AND d.estado != 'finalizado'
)

OR
(
    d.area_origen_id = ?
    AND d.estado = 'pendiente_evaluacion'
)

ORDER BY d.fecha_actualizacion DESC
";

$stmt = $conn->prepare($sql);

$stmt->bind_param("ii", $area, $area);

$stmt->execute();

$result = $stmt->get_result();

$docs = [];

while ($row = $result->fetch_assoc()) {
    $docs[] = $row;
}

echo json_encode($docs);

$stmt->close();
$conn->close();

?>
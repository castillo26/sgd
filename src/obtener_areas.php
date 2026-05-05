<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET");

require_once "conexion.php";

// Verificar conexión
if (!$conn) {
    echo json_encode([
        "success" => false,
        "error" => "Error de conexión a la base de datos"
    ]);
    exit;
}

$sql = "SELECT id, nombre_area FROM areas WHERE estado = 1";
$result = $conn->query($sql);

// Verificar query
if (!$result) {
    echo json_encode([
        "success" => false,
        "error" => $conn->error
    ]);
    exit;
}

$areas = [];

while ($row = $result->fetch_assoc()) {
    $areas[] = $row;
}

echo json_encode([
    "success" => true,
    "data" => $areas
]);

$conn->close();
<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include 'conexion.php';

$sql = "SELECT doc_codID, tipo FROM tipo_doc";
$result = $conn->query($sql);

$tipos = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $tipos[] = $row;
    }
}

echo json_encode([
    "success" => true,
    "data" => $tipos
]);

$conn->close();
?>
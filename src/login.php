<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once "conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

$area = $data['area'] ?? '';
$contrasena = $data['contrasena'] ?? '';

if (empty($area) || empty($contrasena)) {
    echo json_encode([
        "success" => false,
        "message" => "Todos los campos son obligatorios"
    ]);
    exit;
}

// Buscar TODOS los usuarios de esa área
$stmt = $conn->prepare("SELECT id, usuario, contrasena, area, estado, rol FROM usuarios WHERE area = ?");
$stmt->bind_param("i", $area);
$stmt->execute();
$resultado = $stmt->get_result();

$usuarioEncontrado = null;

while ($row = $resultado->fetch_assoc()) {

    if ($row['estado'] != 1) continue;

    if (password_verify($contrasena, $row['contrasena'])) {
        $usuarioEncontrado = $row;
        break;
    }
}

if ($usuarioEncontrado) {

    unset($usuarioEncontrado['contrasena']);

    echo json_encode([
        "success" => true,
        "usuario" => $usuarioEncontrado
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Credenciales incorrectas"
    ]);
}

$stmt->close();
$conn->close();
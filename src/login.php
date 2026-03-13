<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once "config/conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

$correo = $data['correo'];
$contrasena = $data['contrasena'];

$sql = "SELECT * FROM usuarios
        WHERE correo='$correo'
        AND contrasena='$contrasena'
        AND estado=1";

$resultado = $conn->query($sql);

if ($resultado->num_rows > 0) {

    $usuario = $resultado->fetch_assoc();

    echo json_encode([
        "success" => true,
        "usuario" => $usuario
    ]);

} else {

    echo json_encode([
        "success" => false
    ]);

}
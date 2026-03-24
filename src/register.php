<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once "conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

$correo = $data['correo'] ?? '';
$contrasena = $data['contrasena'] ?? '';
$area = $data['area'] ?? 1;

// Validaciones
if (empty($correo) || empty($contrasena)) {
    echo json_encode([
        "success" => false,
        "message" => "Todos los campos son obligatorios"
    ]);
    exit;
}

// Validar formato de email
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "Formato de correo inválido"
    ]);
    exit;
}

// Validar longitud mínima de contraseña
if (strlen($contrasena) < 6) {
    echo json_encode([
        "success" => false,
        "message" => "La contraseña debe tener al menos 6 caracteres"
    ]);
    exit;
}

// Verificar si el correo ya existe (usando prepared statement)
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE correo = ?");
$stmt->bind_param("s", $correo);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    echo json_encode([
        "success" => false,
        "message" => "El correo ya está registrado"
    ]);
    $stmt->close();
    exit;
}
$stmt->close();

// Encriptar la contraseña con bcrypt
$hash_contrasena = password_hash($contrasena, PASSWORD_BCRYPT);

// Rol por defecto para nuevos usuarios
$rol = "usuario";

// Insertar nuevo usuario (usando prepared statement)
$stmt = $conn->prepare("INSERT INTO usuarios (correo, contrasena, area, estado, rol) VALUES (?, ?, ?, 1, ?)");
$stmt->bind_param("ssis", $correo, $hash_contrasena, $area, $rol);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Cuenta creada exitosamente"
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error al crear la cuenta"
    ]);
}

$stmt->close();
$conn->close();
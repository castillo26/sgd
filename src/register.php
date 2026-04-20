<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once "conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

$usuario = $data['usuario'] ?? '';
$contrasena = $data['contrasena'] ?? '';
$area = $data['area'] ?? 1;

// Validaciones
if (empty($usuario) || empty($contrasena)) {
    echo json_encode([
        "success" => false,
        "message" => "Todos los campos son obligatorios"
    ]);
    exit;
}

// Validar longitud mínima de usuario
if (strlen($usuario) < 3) {
    echo json_encode([
        "success" => false,
        "message" => "El usuario debe tener al menos 3 caracteres"
    ]);
    exit;
}

// Contraseñas predefinidas según rol
$PASSWORD_ADMIN = '123456';
$PASSWORD_USUARIO = '123';

// Determinar rol según contraseña y área
$rol = '';
if ($contrasena === $PASSWORD_ADMIN) {
    // Solo OTI (área 14) puede tener administradores
    if ($area != 14) {
        echo json_encode([
            "success" => false,
            "message" => "La contraseña de administrador solo es válida para el área OTI"
        ]);
        exit;
    }
    $rol = 'admin';
} elseif ($contrasena === $PASSWORD_USUARIO) {
    $rol = 'usuario';
} else {
    echo json_encode([
        "success" => false,
        "message" => "Contraseña inválida. Contacte al administrador."
    ]);
    exit;
}

// Verificar si el usuario ya existe (usando prepared statement)
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE usuario = ?");
$stmt->bind_param("s", $usuario);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    echo json_encode([
        "success" => false,
        "message" => "El usuario ya está registrado"
    ]);
    $stmt->close();
    exit;
}
$stmt->close();

// Encriptar la contraseña con bcrypt
$hash_contrasena = password_hash($contrasena, PASSWORD_BCRYPT);

// Insertar nuevo usuario (usando prepared statement)
$stmt = $conn->prepare("INSERT INTO usuarios (usuario, contrasena, area, estado, rol) VALUES (?, ?, ?, 1, ?)");
$stmt->bind_param("ssis", $usuario, $hash_contrasena, $area, $rol);

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
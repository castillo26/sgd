<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once "conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

$correo = $data['correo'] ?? '';
$contrasena = $data['contrasena'] ?? '';

// Validaciones
if (empty($correo) || empty($contrasena)) {
    echo json_encode([
        "success" => false,
        "message" => "Todos los campos son obligatorios"
    ]);
    exit;
}

// Buscar usuario por correo (usando prepared statement para prevenir SQL injection)
$stmt = $conn->prepare("SELECT id, correo, contrasena, area, estado, rol FROM usuarios WHERE correo = ?");
$stmt->bind_param("s", $correo);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    $usuario = $resultado->fetch_assoc();

    // Verificar que el usuario esté activo
    if ($usuario['estado'] != 1) {
        echo json_encode([
            "success" => false,
            "message" => "Usuario inactivo"
        ]);
        $stmt->close();
        exit;
    }

    // Verificar la contraseña
    // Primero verificar si es un hash bcrypt (nuevos usuarios)
    // Si no funciona, intentar comparación directa (usuarios antiguos con contraseñas en texto plano)
    $passwordValid = false;

    if (password_verify($contrasena, $usuario['contrasena'])) {
        $passwordValid = true;
    } elseif ($contrasena === $usuario['contrasena']) {
        // Contraseña en texto plano - actualizar a bcrypt
        $hash_contrasena = password_hash($contrasena, PASSWORD_BCRYPT);
        $updateStmt = $conn->prepare("UPDATE usuarios SET contrasena = ? WHERE id = ?");
        $updateStmt->bind_param("si", $hash_contrasena, $usuario['id']);
        $updateStmt->execute();
        $updateStmt->close();
        $passwordValid = true;
    }

    if ($passwordValid) {
        // No enviar el hash de la contraseña al frontend
        unset($usuario['contrasena']);

        echo json_encode([
            "success" => true,
            "usuario" => $usuario
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Credenciales incorrectas"
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Credenciales incorrectas"
    ]);
}

$stmt->close();
$conn->close();
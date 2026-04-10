?><?php

$host = "localhost"; 
$user = "rodo34_usuariomuni";
$password = "OTImdh2026@";
$database = "rodo34_test_sgd";

// Crear conexión
$conn = new mysqli($host, $user, $password, $database);

// Verificar conexión
if ($conn->connect_error) {
    echo json_encode([
        "success" => false,
        "message" => "Error de conexión a la base de datos",
        "error" => $conn->connect_error
    ]);
    exit;
}


$conn->set_charset("utf8mb4");

?>
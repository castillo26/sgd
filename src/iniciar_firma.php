<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'conexion.php';

$documento_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($documento_id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de documento requerido']);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT id, nombre, archivo FROM documentos WHERE id = ?");
    $stmt->bind_param("i", $documento_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $doc = $result->fetch_assoc();

    if (!$doc) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Documento no encontrado']);
        exit;
    }

    $token = bin2hex(random_bytes(32));

    $stmtToken = $conn->prepare("INSERT INTO tokens_firma (documento_id, token, estado, created_at) VALUES (?, ?, 'pendiente', NOW())");
    $stmtToken->bind_param("is", $documento_id, $token);
    $stmtToken->execute();
    $stmtToken->close();

    echo json_encode([
        'success' => true,
        'token' => $token,
        'documento' => [
            'id' => $doc['id'],
            'nombre' => $doc['nombre'],
            'archivo' => $doc['archivo']
        ]
    ]);

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
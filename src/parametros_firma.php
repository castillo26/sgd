<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include 'conexion.php';

try {
    $baseUrl = "http://localhost:8080/sgd-api";

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $documento_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        if ($documento_id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID requerido']);
            exit;
        }

        $stmt = $conn->prepare("SELECT id, nombre, archivo FROM documentos WHERE id = ?");
        $stmt->bind_param("i", $documento_id);
        $stmt->execute();
        $doc = $stmt->get_result()->fetch_assoc();

        if (!$doc) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Documento no encontrado']);
            exit;
        }

        echo json_encode([
            'success' => true,
            'params' => [
                "documentToSign" => "$baseUrl/{$doc['archivo']}",
                "documentSignedUrl" => "$baseUrl/guardar_firmado.php",
                "token" => bin2hex(random_bytes(32)),
                "documentId" => $doc['id']
            ]
        ]);
        $stmt->close();
    }

    elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $param_token = isset($_POST['param_token']) ? $_POST['param_token'] : '';

        if (empty($param_token)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Token requerido']);
            exit;
        }

        $response = [
            "documentToSign" => "$baseUrl/$param_token/placeholder.pdf",
            "documentSignedUrl" => "$baseUrl/guardar_firmado.php",
            "token" => $param_token
        ];

        echo base64_encode(json_encode($response));
    }

    $conn->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
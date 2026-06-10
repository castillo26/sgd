<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once __DIR__ . '/vendor/autoload.php';

use setasign\Fpdi\Fpdi;

include 'conexion.php';

// Verificar si se enviaron archivos
if (!isset($_FILES['pdfs']) || !is_array($_FILES['pdfs']['name'])) {
    echo json_encode([
        'success' => false,
        'message' => 'No se enviaron archivos PDF'
    ]);
    exit;
}

$pdfs = $_FILES['pdfs'];
$totalArchivos = count($pdfs['name']);

// Validar que todos sean PDF
for ($i = 0; $i < $totalArchivos; $i++) {
    if ($pdfs['type'][$i] !== 'application/pdf') {
        echo json_encode([
            'success' => false,
            'message' => 'Solo se permiten archivos PDF'
        ]);
        exit;
    }
}

// Crear directorio de uploads si no existe
$uploadDir = 'uploads/temp/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Mover archivos temporales
$rutasTemp = [];
for ($i = 0; $i < $totalArchivos; $i++) {
    $nombreTemp = uniqid() . '_temp_' . $i . '.pdf';
    $rutaTemp = $uploadDir . $nombreTemp;
    if (!move_uploaded_file($pdfs['tmp_name'][$i], $rutaTemp)) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al guardar archivo temporal'
        ]);
        exit;
    }
    $rutasTemp[] = $rutaTemp;
}

// Generar nombre único para el archivo unido
$nombreUnido = uniqid() . '_unido.pdf';
$rutaUnido = 'uploads/' . $nombreUnido;

try {
    // Usar FPDI para unir PDFs

    $pdf = new FPDI();

    // Agregar cada PDF
    foreach ($rutasTemp as $ruta) {
        $pageCount = $pdf->setSourceFile($ruta);
        for ($i = 1; $i <= $pageCount; $i++) {
            $tplId = $pdf->importPage($i);
            $pdf->addPage();
            $pdf->useTemplate($tplId);
        }
    }

    // Guardar el PDF unido
    $pdf->Output($rutaUnido, 'F');

    // Limpiar archivos temporales
    foreach ($rutasTemp as $ruta) {
        if (file_exists($ruta)) {
            unlink($ruta);
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'PDFs unidos correctamente',
        'archivo' => $rutaUnido
    ]);

} catch (Exception $e) {
    // Limpiar archivos temporales en caso de error
    foreach ($rutasTemp as $ruta) {
        if (file_exists($ruta)) {
            unlink($ruta);
        }
    }

    echo json_encode([
        'success' => false,
        'message' => 'Error al unir PDFs: ' . $e->getMessage()
    ]);
}
?>
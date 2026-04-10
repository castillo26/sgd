<?php
// =============================================
// GENERADOR DE USUARIOS PARA NUEVAS ÁREAS
// Ejecutar este script una vez para generar los INSERT SQL
// =============================================

// Generar hash de la contraseña '123456'
$hash = password_hash('123456', PASSWORD_DEFAULT);

// Áreas nuevas (del 5 al 25 según la tabla proporcionada)
$areas = [
    5 => 'Secretario General',
    6 => 'Caja',
    7 => 'Ejecutoria Coactiva',
    8 => 'Desarrollo Economico y Turismo',
    9 => 'Logistica',
    10 => 'Salud',
    11 => 'DEMUNA',
    12 => 'Programacion e Inversiones',
    13 => 'Imagen Institucional',
    14 => 'OTI',
    15 => 'Seguridad Ciudadana',
    16 => 'Educacion',
    17 => 'Vialidad',
    18 => 'Riesgos',
    19 => 'OMAPED',
    20 => 'Obras Privadas',
    21 => 'Fiscalizacion',
    22 => 'Registro Civil',
    23 => 'Tesoreria',
    24 => 'Obras Publicas',
    25 => 'Asesoria Juridica'
];

// Generar los INSERT SQL
echo "-- Hash generado para contraseña '123456':\n";
echo "-- " . $hash . "\n\n";
echo "-- INSERT SQL para nuevos usuarios:\n\n";

foreach ($areas as $id => $nombre) {
    $admin_email = "admin_" . strtolower(str_replace(' ', '', $nombre)) . "@gmail.com";
    $user_email = "usuario_" . strtolower(str_replace(' ', '', $nombre)) . "@gmail.com";

    echo "INSERT INTO usuarios (correo, contraseña, area, estado, rol) VALUES\n";
    echo "('{$admin_email}', '{$hash}', {$id}, 1, 'admin'),\n";
    echo "('{$user_email}', '{$hash}', {$id}, 1, 'usuario');\n\n";
}

echo "\n-- =============================================\n";
echo "-- También ejecutar este ALTER TABLE primero:\n";
echo "-- ALTER TABLE documentos ADD COLUMN comentario TEXT NULL DEFAULT NULL AFTER estado;\n";
echo "-- =============================================\n";
?>
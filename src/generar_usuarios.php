<?php
// =============================================
// GENERADOR DE USUARIOS PARA NUEVAS ÁREAS
// Ejecutar este script una vez para generar los INSERT SQL
// =============================================

// Contraseñas predefinidas según rol
$PASSWORD_ADMIN = '123456';
$PASSWORD_USUARIO = '123';

// Generar hashes de las contraseñas
$hash_admin = password_hash($PASSWORD_ADMIN, PASSWORD_DEFAULT);
$hash_usuario = password_hash($PASSWORD_USUARIO, PASSWORD_DEFAULT);

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
echo "-- =============================================\n";
echo "-- Hash generado para contraseña '123456' (admin):\n";
echo "-- " . $hash_admin . "\n\n";
echo "-- Hash generado para contraseña '123' (usuario):\n";
echo "-- " . $hash_usuario . "\n\n";
echo "-- INSERT SQL para nuevos usuarios:\n\n";

foreach ($areas as $id => $nombre) {
    // Generar nombre de usuario simple (sin @)
    $nombre_simple = strtolower(str_replace(' ', '', $nombre));

    // Solo OTI (área 14) tiene admin
    if ($id == 14) {
        $admin_user = "admin_{$nombre_simple}";
        echo "INSERT INTO usuarios (usuario, contrasena, area, estado, rol) VALUES\n";
        echo "('{$admin_user}', '{$hash_admin}', {$id}, 1, 'admin');\n\n";
    }

    // Todos tienen usuario normal
    $user_user = "usuario_{$nombre_simple}";
    echo "INSERT INTO usuarios (usuario, contrasena, area, estado, rol) VALUES\n";
    echo "('{$user_user}', '{$hash_usuario}', {$id}, 1, 'usuario');\n\n";
}

echo "\n-- =============================================\n";
echo "-- NOTA IMPORTANTE:\n";
echo "-- - Contraseña para USUARIOS: 123\n";
echo "-- - Contraseña para ADMIN (solo OTI): 123456\n";
echo "-- =============================================\n";
?>
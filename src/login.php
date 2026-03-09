<?php
session_start();
require_once "config/conexion.php";

$correo = $_POST['correo'];
$contrasena = $_POST['contrasena'];

$sql = "SELECT * FROM usuarios 
        WHERE correo='$correo' 
        AND contrasena='$contrasena'
        AND estado=1";

$resultado = $conn->query($sql);

if ($resultado->num_rows > 0) {

    $usuario = $resultado->fetch_assoc();

    $_SESSION['usuario_id'] = $usuario['id'];
    $_SESSION['correo'] = $usuario['correo'];
    $_SESSION['area'] = $usuario['area'];

    header("Location: dashboard.php");

} else {

    echo "Usuario o contraseña incorrectos";

}

?>
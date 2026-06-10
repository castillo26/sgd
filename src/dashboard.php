<?php
session_start();

if(!isset($_SESSION['usuario_id'])){
    header("Location: index.php");
    exit();
}

?>

<h1>Bienvenido al SGD</h1>

<p>Usuario: <?php echo $_SESSION['correo']; ?></p>
<p>Área: <?php echo $_SESSION['area']; ?></p>

<a href="logout.php">Cerrar sesión</a>
<?php

$host = "localhost";
$user = "root";
$password = "";
$db = "rodo34_test_sgd";

$conn = new mysqli($host,$user,$password,$db);

if($conn->connect_error){
die("Error de conexión");
}

?>
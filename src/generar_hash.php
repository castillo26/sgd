<?php
echo password_hash("12345", PASSWORD_BCRYPT);
echo "<br>";
echo password_hash("123456", PASSWORD_BCRYPT);
?>
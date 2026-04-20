-- =============================================
-- SCRIPT SQL PARA ACTUALIZAR USUARIOS
-- Cambiar columna 'correo' a 'usuario'
-- y actualizar usuarios existentes con nombres reales
-- =============================================

-- 1. Renombrar columna 'correo' a 'usuario'
ALTER TABLE usuarios CHANGE COLUMN correo usuario VARCHAR(255);

-- 2. Actualizar usuarios existentes con nombres de usuario realistas
-- Los usuarios existentes con correos genéricos se actualizan a nombres simples

-- Área 1: Administración
UPDATE usuarios SET usuario = 'usuario_administracion' WHERE area = 1 AND rol = 'usuario';

-- Área 2: Contabilidad
UPDATE usuarios SET usuario = 'usuario_contabilidad' WHERE area = 2 AND rol = 'usuario';

-- Área 3: Gerencia
UPDATE usuarios SET usuario = 'usuario_gerencia' WHERE area = 3 AND rol = 'usuario';

-- Área 4: RRHH
UPDATE usuarios SET usuario = 'usuario_rrhh' WHERE area = 4 AND rol = 'usuario';

-- Área 5: Secretario General
UPDATE usuarios SET usuario = 'usuario_secretariageneral' WHERE area = 5 AND rol = 'usuario';

-- Área 6: Caja
UPDATE usuarios SET usuario = 'usuario_caja' WHERE area = 6 AND rol = 'usuario';

-- Área 7: Ejecutoria Coactiva
UPDATE usuarios SET usuario = 'usuario_ejecutoria' WHERE area = 7 AND rol = 'usuario';

-- Área 8: Desarrollo Economico y Turismo
UPDATE usuarios SET usuario = 'usuario_desarrollo' WHERE area = 8 AND rol = 'usuario';

-- Área 9: Logistica
UPDATE usuarios SET usuario = 'usuario_logistica' WHERE area = 9 AND rol = 'usuario';

-- Área 10: Salud
UPDATE usuarios SET usuario = 'usuario_salud' WHERE area = 10 AND rol = 'usuario';

-- Área 11: DEMUNA
UPDATE usuarios SET usuario = 'usuario_demuna' WHERE area = 11 AND rol = 'usuario';

-- Área 12: Programacion e Inversiones
UPDATE usuarios SET usuario = 'usuario_programacion' WHERE area = 12 AND rol = 'usuario';

-- Área 13: Imagen Institucional
UPDATE usuarios SET usuario = 'usuario_imagen' WHERE area = 13 AND rol = 'usuario';

-- Área 14: OTI (Administradores)
UPDATE usuarios SET usuario = 'admin_oti' WHERE area = 14 AND rol = 'admin';

-- Área 15: Seguridad Ciudadana
UPDATE usuarios SET usuario = 'usuario_seguridad' WHERE area = 15 AND rol = 'usuario';

-- Área 16: Educacion
UPDATE usuarios SET usuario = 'usuario_educacion' WHERE area = 16 AND rol = 'usuario';

-- Área 17: Vialidad
UPDATE usuarios SET usuario = 'usuario_vialidad' WHERE area = 17 AND rol = 'usuario';

-- Área 18: Riesgos
UPDATE usuarios SET usuario = 'usuario_riesgos' WHERE area = 18 AND rol = 'usuario';

-- Área 19: OMAPED
UPDATE usuarios SET usuario = 'usuario_omaped' WHERE area = 19 AND rol = 'usuario';

-- Área 20: Obras Privadas
UPDATE usuarios SET usuario = 'usuario_obrasprivadas' WHERE area = 20 AND rol = 'usuario';

-- Área 21: Fiscalizacion
UPDATE usuarios SET usuario = 'usuario_fiscalizacion' WHERE area = 21 AND rol = 'usuario';

-- Área 22: Registro Civil
UPDATE usuarios SET usuario = 'usuario_registrocivil' WHERE area = 22 AND rol = 'usuario';

-- Área 23: Tesoreria
UPDATE usuarios SET usuario = 'usuario_tesoreria' WHERE area = 23 AND rol = 'usuario';

-- Área 24: Obras Publicas
UPDATE usuarios SET usuario = 'usuario_obraspublicas' WHERE area = 24 AND rol = 'usuario';

-- Área 25: Asesoria Juridica
UPDATE usuarios SET usuario = 'usuario_asesoria' WHERE area = 25 AND rol = 'usuario';

-- =============================================
-- CONTRASEÑAS DEL SISTEMA:
-- - Usuarios normales: 123
-- - Administradores (solo OTI): 123456
-- =============================================
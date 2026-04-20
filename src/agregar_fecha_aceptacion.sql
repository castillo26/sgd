-- Agregar columna fecha_aceptacion a la tabla documentos
ALTER TABLE documentos ADD COLUMN fecha_aceptacion DATETIME NULL;

-- Crear tabla de historial para registrar todos los cambios de estado
CREATE TABLE IF NOT EXISTS historial_documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    documento_id INT NOT NULL,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50),
    comentario TEXT,
    usuario_id INT,
    fecha_cambio DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (documento_id) REFERENCES documentos(id)
);
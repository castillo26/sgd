-- Agregar columna documento_padre_id para vincular respuestas con documentos originales
ALTER TABLE documentos ADD COLUMN documento_padre_id INT NULL;

-- Agregar índice para mejorar consultas de documentos vinculados
ALTER TABLE documentos ADD INDEX idx_documento_padre (documento_padre_id);

-- Agregar clave foránea opcional (puede ser NULL para documentos sin padre)
ALTER TABLE documentos
ADD CONSTRAINT fk_documento_padre
FOREIGN KEY (documento_padre_id) REFERENCES documentos(id) ON DELETE SET NULL;

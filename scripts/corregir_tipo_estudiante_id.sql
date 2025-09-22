-- Script para corregir el tipo de dato de estudiante_id en la tabla asistencias
-- Ejecutar este script en PostgreSQL

-- Verificar el tipo actual de la columna
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'asistencias' AND column_name = 'estudiante_id';

-- Verificar datos existentes en asistencias
SELECT COUNT(*) as total_registros FROM asistencias;
SELECT estudiante_id, COUNT(*) as cantidad 
FROM asistencias 
GROUP BY estudiante_id 
ORDER BY estudiante_id;

-- Si hay datos, primero necesitamos verificar que todos los estudiante_id 
-- correspondan a documentos válidos en la tabla estudiantes
SELECT a.estudiante_id, e.documento
FROM asistencias a
LEFT JOIN estudiantes e ON a.estudiante_id::text = e.documento
WHERE e.documento IS NULL;

-- OPCIÓN 1: Si NO hay datos en asistencias, simplemente cambiar el tipo
-- ALTER TABLE asistencias ALTER COLUMN estudiante_id TYPE VARCHAR(20);

-- OPCIÓN 2: Si HAY datos, necesitamos hacer una migración más cuidadosa
-- Paso 1: Agregar nueva columna temporal
ALTER TABLE asistencias ADD COLUMN estudiante_documento VARCHAR(20);

-- Paso 2: Copiar datos convertidos (asumiendo que estudiante_id contiene IDs numéricos)
-- que necesitan ser mapeados a documentos reales
-- Esta parte depende de cómo están relacionados los datos actuales

-- Si estudiante_id ya contiene documentos (strings) pero está como INTEGER:
UPDATE asistencias SET estudiante_documento = estudiante_id::text;

-- Paso 3: Eliminar la columna antigua
ALTER TABLE asistencias DROP COLUMN estudiante_id;

-- Paso 4: Renombrar la nueva columna
ALTER TABLE asistencias RENAME COLUMN estudiante_documento TO estudiante_id;

-- Paso 5: Agregar restricciones si es necesario
ALTER TABLE asistencias ADD CONSTRAINT fk_asistencias_estudiante 
FOREIGN KEY (estudiante_id) REFERENCES estudiantes(documento);

-- Verificar el resultado
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'asistencias' AND column_name = 'estudiante_id';

-- Verificar que las relaciones funcionen
SELECT a.id, a.estudiante_id, e.nombre, e.apellido
FROM asistencias a
JOIN estudiantes e ON a.estudiante_id = e.documento
LIMIT 5;
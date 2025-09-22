-- Script para crear la relación entre usuario y profesor
-- Ejecutar este script en PostgreSQL

-- Verificar usuarios existentes
SELECT id, nombre, apellido, email, rol_id FROM usuarios;

-- Verificar profesores existentes
SELECT id, nombre, apellido, documento, usuario_id FROM profesores;

-- Crear un profesor asociado al usuario si no existe
-- Cambiar el ID del usuario según corresponda
INSERT INTO profesores (nombre, apellido, documento, email, telefono, usuario_id, estado)
SELECT 
    u.nombre,
    u.apellido,
    u.documento,
    u.email,
    '0000000000' as telefono,  -- Teléfono por defecto
    u.id as usuario_id,
    true as estado
FROM usuarios u
WHERE u.rol_id = (SELECT id FROM roles WHERE nombre = 'Profesor')
  AND NOT EXISTS (
      SELECT 1 FROM profesores p WHERE p.usuario_id = u.id
  );

-- Verificar que se creó la relación
SELECT 
    u.nombre as usuario_nombre,
    u.email,
    r.nombre as rol,
    p.id as profesor_id,
    p.nombre as profesor_nombre
FROM usuarios u
JOIN roles r ON u.rol_id = r.id
LEFT JOIN profesores p ON u.id = p.usuario_id
WHERE r.nombre = 'Profesor';

-- Si necesitas crear un profesor específico manualmente:
-- INSERT INTO profesores (nombre, apellido, documento, email, telefono, usuario_id, estado)
-- VALUES ('Nombre', 'Apellido', '12345678', 'email@ejemplo.com', '1234567890', [ID_USUARIO], true);
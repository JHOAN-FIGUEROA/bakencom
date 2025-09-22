const express = require('express');
const router = express.Router();
const { verificarToken, verificarPermiso } = require('../middleware/auth');

const {
  obtenerClases,
  crearClase,
  obtenerClasePorId,
  actualizarClase,
  eliminarClase,
  obtenerClasesPorGrupo,
  obtenerClasesPorProfesor,
  obtenerClasesPorDia,
  obtenerClasesParaAsistencia
} = require('../Controllers/clasesController');

// Rutas específicas (deben ir ANTES de las rutas con parámetros)
router.get('/para-asistencia', verificarToken, verificarPermiso('acceso_asistencias'), obtenerClasesParaAsistencia);
// router.get('/reporte-asistencias', verificarToken, verificarPermiso('acceso_asistencias'), obtenerReporteAsistencias);
router.get('/grupo/:grupo_id', obtenerClasesPorGrupo);
router.get('/profesor/:profesor_id', obtenerClasesPorProfesor);
router.get('/dia/:dia_semana', obtenerClasesPorDia);

// Rutas básicas CRUD
router.get('/', obtenerClases);
router.post('/', crearClase);
router.get('/:id', obtenerClasePorId);
router.put('/:id', actualizarClase);
router.delete('/:id', eliminarClase);

module.exports = router;
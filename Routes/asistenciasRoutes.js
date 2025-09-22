const express = require('express');
const router = express.Router();
const { verificarToken, verificarPermiso } = require('../middleware/auth');

const {
  obtenerAsistencias,
  crearAsistencia,
  obtenerAsistenciaPorId,
  actualizarAsistencia,
  eliminarAsistencia,
  obtenerAsistenciasPorClase,
  obtenerAsistenciasPorEstudiante,
  verificarAsistenciaExistente
} = require('../Controllers/asistenciasController');

// Rutas básicas CRUD
router.get('/', obtenerAsistencias);
router.post('/', crearAsistencia);
router.get('/:id', obtenerAsistenciaPorId);
router.put('/:id', actualizarAsistencia);
router.delete('/:id', eliminarAsistencia);

// Rutas específicas
router.get('/verificar/:clase_id', verificarToken, verificarPermiso('acceso_asistencias'), verificarAsistenciaExistente);
router.get('/clase/:clase_id', verificarToken, verificarPermiso('acceso_asistencias'), obtenerAsistenciasPorClase);
router.get('/estudiante/:estudiante_id', obtenerAsistenciasPorEstudiante);

module.exports = router;
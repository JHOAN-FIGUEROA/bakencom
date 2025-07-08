const express = require('express');
const router = express.Router();

const {
  obtenerAsistencias,
  crearAsistencia,
  obtenerAsistenciaPorId,
  actualizarAsistencia,
  eliminarAsistencia,
  obtenerAsistenciasPorClase,
  obtenerAsistenciasPorEstudiante
} = require('../Controllers/asistenciasController');

// Rutas básicas CRUD
router.get('/', obtenerAsistencias);
router.post('/', crearAsistencia);
router.get('/:id', obtenerAsistenciaPorId);
router.put('/:id', actualizarAsistencia);
router.delete('/:id', eliminarAsistencia);

// Rutas específicas
router.get('/clase/:clase_id', obtenerAsistenciasPorClase);
router.get('/estudiante/:estudiante_id', obtenerAsistenciasPorEstudiante);

module.exports = router; 
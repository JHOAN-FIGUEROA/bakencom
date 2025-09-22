const express = require('express');
const router = express.Router();

const {
  obtenerEstudiantes,
  crearEstudiante,
  obtenerEstudiantePorDocumento,
  actualizarEstudiante,
  eliminarEstudiante,
  buscarEstudiantes,
  obtenerEstudiantesPorPrograma,
  obtenerEstudiantesPorDepartamento
} = require('../Controllers/estudiantesController');

// Rutas básicas CRUD
router.get('/', obtenerEstudiantes);
router.post('/', crearEstudiante);
router.get('/:documento', obtenerEstudiantePorDocumento);
router.put('/:documento', actualizarEstudiante);
router.delete('/:documento', eliminarEstudiante);
router.put('/estado/:documento', require('../Controllers/estudiantesController').cambiarEstadoEstudiante);

// Rutas específicas
router.get('/buscar', buscarEstudiantes);
router.get('/programa/:programa', obtenerEstudiantesPorPrograma);
router.get('/departamento/:departamento', obtenerEstudiantesPorDepartamento);

module.exports = router; 
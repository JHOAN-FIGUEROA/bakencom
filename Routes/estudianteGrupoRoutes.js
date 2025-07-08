const express = require('express');
const router = express.Router();

const {
  asignarEstudianteAGrupo,
  removerEstudianteDeGrupo,
  obtenerAsignaciones,
  obtenerGruposDeEstudiante,
  obtenerEstudiantesDeGrupo
} = require('../Controllers/estudianteGrupoController');

// Rutas para asignaciones
router.get('/', obtenerAsignaciones);
router.post('/', asignarEstudianteAGrupo);
router.delete('/:estudiante_id/:grupo_id', removerEstudianteDeGrupo);

// Rutas específicas
router.get('/estudiante/:estudiante_id', obtenerGruposDeEstudiante);
router.get('/grupo/:grupo_id', obtenerEstudiantesDeGrupo);

module.exports = router; 
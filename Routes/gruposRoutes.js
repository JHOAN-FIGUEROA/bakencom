const express = require('express');
const router = express.Router();

const {
  obtenerGrupos,
  crearGrupo,
  obtenerGrupoPorId,
  actualizarGrupo,
  eliminarGrupo,
  obtenerEstudiantesDelGrupo,
  obtenerClasesDelGrupo
} = require('../Controllers/gruposController');

// Rutas básicas CRUD
router.get('/', obtenerGrupos);
router.post('/', crearGrupo);
router.get('/:id', obtenerGrupoPorId);
router.put('/:id', actualizarGrupo);
router.delete('/:id', eliminarGrupo);

// Rutas específicas
router.get('/:id/estudiantes', obtenerEstudiantesDelGrupo);
router.get('/:id/clases', obtenerClasesDelGrupo);

module.exports = router; 
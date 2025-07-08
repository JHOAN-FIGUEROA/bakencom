const express = require('express');
const router = express.Router();

const {
  obtenerProgramas,
  crearPrograma,
  obtenerProgramaPorId,
  actualizarPrograma,
  eliminarPrograma
} = require('../Controllers/programasController');

router.get('/', obtenerProgramas);
router.post('/', crearPrograma);
router.get('/:id', obtenerProgramaPorId);
router.put('/:id', actualizarPrograma);
router.delete('/:id', eliminarPrograma);

module.exports = router; 
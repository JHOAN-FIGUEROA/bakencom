const express = require('express');
const router = express.Router();

const {
  obtenerProfesores,
  crearProfesor,
  obtenerProfesorPorId,
  obtenerProfesorPorDocumento,
  actualizarProfesor,
  eliminarProfesor,
  buscarProfesores,
  obtenerClasesDelProfesor
} = require('../Controllers/profesoresController');

// Rutas básicas CRUD
router.get('/', obtenerProfesores);
router.post('/', crearProfesor);
router.get('/:id', obtenerProfesorPorId);
router.put('/:id', actualizarProfesor);
router.delete('/:id', eliminarProfesor);

// Rutas específicas
router.get('/documento/:documento', obtenerProfesorPorDocumento);
router.get('/buscar', buscarProfesores);
router.get('/:id/clases', obtenerClasesDelProfesor);

module.exports = router; 
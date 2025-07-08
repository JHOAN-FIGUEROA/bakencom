const express = require('express');
const router = express.Router();

const {
  obtenerClases,
  crearClase,
  obtenerClasePorId,
  actualizarClase,
  eliminarClase,
  obtenerClasesPorGrupo,
  obtenerClasesPorProfesor,
  obtenerClasesPorDia
} = require('../Controllers/clasesController');

// Rutas básicas CRUD
router.get('/', obtenerClases);
router.post('/', crearClase);
router.get('/:id', obtenerClasePorId);
router.put('/:id', actualizarClase);
router.delete('/:id', eliminarClase);

// Rutas específicas
router.get('/grupo/:grupo_id', obtenerClasesPorGrupo);
router.get('/profesor/:profesor_id', obtenerClasesPorProfesor);
router.get('/dia/:dia_semana', obtenerClasesPorDia);

module.exports = router; 
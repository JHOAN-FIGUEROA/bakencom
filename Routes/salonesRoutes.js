const express = require('express');
const router = express.Router();

const {
  obtenerSalones,
  crearSalon,
  obtenerSalonPorId,
  actualizarSalon,
  eliminarSalon,
  cambiarEstadoSalon
} = require('../Controllers/salonesController');

// Rutas CRUD
router.get('/', obtenerSalones);
router.post('/', crearSalon);
router.get('/:id', obtenerSalonPorId);
router.put('/:id', actualizarSalon);
router.delete('/:id', eliminarSalon);
router.patch('/:id/estado', cambiarEstadoSalon);

module.exports = router; 
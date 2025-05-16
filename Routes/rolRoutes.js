const express = require('express');
const router = express.Router();
const rolesController = require('..//Controllers/rolesController');

router.get('/', rolesController.obtenerRoles);
router.get('/buscar', rolesController.buscarRoles);
router.get('/:id', rolesController.obtenerDetalleRol);
router.post('/', rolesController.crearRol);
router.put('/cambiar-estado/:id', rolesController.cambiarEstadoRol);
router.put('/:id', rolesController.editarRol);
router.delete('/:id', rolesController.eliminarRol);
module.exports = router;

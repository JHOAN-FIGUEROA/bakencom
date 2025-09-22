const express = require('express');
const router = express.Router();
const usuarioController = require('../Controllers/usuarioController');

router.get('/', usuarioController.obtenerUsuarios);
router.post('/', usuarioController.crearUsuario);
router.post('/login', usuarioController.login);
router.get('/contador', usuarioController.contarUsuarios);
router.get('/:id', usuarioController.obtenerDetalleUsuario);
router.put('/:id', usuarioController.actualizarUsuario);
router.put('/estado/:id', usuarioController.cambiarEstadoUsuario);
router.delete('/:id', usuarioController.eliminarUsuario);
router.post('/solicitar-recuperacion', usuarioController.solicitarRecuperacion);
router.post('/restablecer-contrasena', usuarioController.restablecerContrasena);


module.exports = router;

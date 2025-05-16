const express = require('express');
const router = express.Router();
const usuarioController = require('../Controllers/usuarioController');

router.get('/', usuarioController.obtenerUsuarios);
router.post('/', usuarioController.crearUsuario);
router.post('/login', usuarioController.login);

module.exports = router;

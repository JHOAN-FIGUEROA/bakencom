// rutas permisos
const express = require('express');

const listarPermisos = require('../Controllers/permisosController');

const router = express.Router();

router.get('/', listarPermisos);

module.exports = router;
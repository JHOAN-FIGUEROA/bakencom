const express = require('express');
const router = express.Router();
const { verificarToken, verificarPermiso } = require('../middleware/auth');
const dashboard = require('../Controllers/dashboardController');

// Resumen principal del dashboard
router.get('/resumen', verificarToken, dashboard.resumen);

// Serie temporal de asistencias
router.get('/asistencias-diarias', verificarToken, verificarPermiso('acceso_asistencias'), dashboard.asistenciasDiarias);

// Distribución: estudiantes por programa (Top N)
router.get('/estudiantes-por-programa', verificarToken, verificarPermiso('acceso_estudiantes'), dashboard.estudiantesPorPrograma);

module.exports = router;
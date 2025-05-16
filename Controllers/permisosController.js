const { permisos } = require('../models');

const listarPermisos = async (req, res) => {
  try {
    const permisosList = await permisos.findAll();
    res.json({ permisos: permisosList });
  } catch (error) {
    console.error('Error en listarPermisos:', error);
    res.status(500).json({ error: 'Error al obtener permisos' });
  }
};

module.exports = listarPermisos ;

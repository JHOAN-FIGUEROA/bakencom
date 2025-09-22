const { permisos } = require('../models');

const listarPermisos = async (req, res) => {
  try {
    if (req.query.all === 'true') {
      const permisosList = await permisos.findAll();
      return res.json({ permisos: permisosList });
    }
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = 5;
    const offset = (pagina - 1) * limite;
    const { count, rows } = await permisos.findAndCountAll({
      limit: limite,
      offset: offset
    });
    const totalPaginas = Math.ceil(count / limite);
    res.json({
      permisos: rows,
      totalPermisos: count,
      totalPaginas,
      paginaActual: pagina
    });
  } catch (error) {
    console.error('Error en listarPermisos:', error);
    res.status(500).json({ error: 'Error al obtener permisos' });
  }
};

module.exports = listarPermisos ;

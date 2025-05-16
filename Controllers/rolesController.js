const { roles: Rol } = require('../models');
const { roles_permisos, permisos, usuarios: Usuario } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  async obtenerRoles(req, res)  {
  try {
    const { page = 1, size = 10, search = '' } = req.query;
    const limit = parseInt(size);
    const offset = (parseInt(page) - 1) * limit;

    const { count, rows } = await Rol.findAndCountAll({
      where: {
        nombre: {
          [Op.iLike]: `%${search}%`
        }
      },
      limit,
      offset,
      order: [['id', 'ASC']],
    });

    res.json({
      total: count,
      page: parseInt(page),
      size: limit,
      roles: rows
    });
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ mensaje: 'Error al obtener roles' });
  }
},

  async obtenerDetalleRol(req, res) {
    try {
      const { id } = req.params;

      const rol = await Rol.findOne({
        where: { id },
        attributes: ['id', 'nombre', 'estado'],
        include: [
          {
            model: permisos,
            as: 'permisos_asociados',
            attributes: ['id', 'nombre'],
            through: { attributes: [] }
          }
        ]
      });

      if (!rol) {
        return res.status(404).json({ mensaje: 'Rol no encontrado' });
      }

      res.json({
        id: rol.id,
        nombre: rol.nombre,
        estado: rol.estado,
        permisos: rol.permisos_asociados
      });
    } catch (error) {
      console.error('Error al obtener detalles del rol:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  },

  async crearRol(req, res) {
    try {
      const { nombre, permisos_ids } = req.body;

      if (!nombre || !Array.isArray(permisos_ids)) {
        return res.status(400).json({ error: 'Nombre y lista de permisos son requeridos' });
      }

      const nuevoRol = await Rol.create({ nombre });

      const asociaciones = permisos_ids.map(idPermiso => ({
        rol_id: nuevoRol.id,
        permiso_id: idPermiso  // 🔥 Aquí estaba el error
      }));

      await roles_permisos.bulkCreate(asociaciones);

      res.status(201).json({ mensaje: 'Rol creado con éxito', rol: nuevoRol });
    } catch (error) {
      console.error('Error al crear el rol:', error);
      res.status(500).json({ error: 'Error al crear el rol' });
    }
  },

  async editarRol(req, res) {
    const { id } = req.params;
    const { nombre, permisos: nuevosPermisos } = req.body;

    try {
      const rolEncontrado = await Rol.findByPk(id);
      if (!rolEncontrado) {
        return res.status(404).json({ mensaje: 'Rol no encontrado' });
      }

      if (nombre !== undefined) rolEncontrado.nombre = nombre;
      await rolEncontrado.save();

      if (Array.isArray(nuevosPermisos)) {
        await roles_permisos.destroy({ where: { rol_id: id } });

        const permisosAInsertar = nuevosPermisos.map(idPermiso => ({
          rol_id: id,
          permiso_id: idPermiso  // 🔥 Aquí también se corrige
        }));

        await roles_permisos.bulkCreate(permisosAInsertar);
      }

      res.json({ mensaje: 'Rol actualizado correctamente' });
    } catch (error) {
      console.error('Error al editar el rol:', error);
      res.status(500).json({ mensaje: 'Error al editar el rol' });
    }
  },

  async eliminarRol(req, res) {
    const { id } = req.params;

    try {
      const rolEncontrado = await Rol.findByPk(id);
      if (!rolEncontrado) {
        return res.status(404).json({ mensaje: 'Rol no encontrado' });
      }

      const usuariosConRol = await Usuario.count({ where: { rol_id: id } });
      if (usuariosConRol > 0) {
        return res.status(400).json({ mensaje: 'No se puede eliminar el rol porque tiene usuarios asociados' });
      }

      await roles_permisos.destroy({ where: { rol_id: id } });
      await Rol.destroy({ where: { id } });

      res.json({ mensaje: 'Rol y sus permisos asociados eliminados con éxito' });
    } catch (error) {
      console.error('Error al eliminar el rol:', error);
      res.status(500).json({ mensaje: 'Error al eliminar el rol' });
    }
  },

  async cambiarEstadoRol(req, res) {
    const { id } = req.params;
    const { estado } = req.body;

    if (typeof estado !== 'boolean') {
      return res.status(400).json({ error: 'El estado debe ser un valor booleano (true/false)' });
    }

    try {
      const rolEncontrado = await Rol.findByPk(id);
      if (!rolEncontrado) return res.status(404).json({ error: 'Rol no encontrado' });

      rolEncontrado.estado = estado;
      await rolEncontrado.save();

      res.json({ mensaje: 'Estado del rol actualizado', estado: rolEncontrado.estado });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al cambiar estado del rol' });
    }
  },

  async buscarRoles(req, res) {
    try {
      const { nombre, pagina = 1, limite = 10 } = req.query;

      const condiciones = {};
      if (nombre) {
        condiciones.nombre = { [Op.iLike]: `%${nombre}%` };
      }

      const offset = (parseInt(pagina) - 1) * parseInt(limite);
      const { count, rows } = await Rol.findAndCountAll({
        where: condiciones,
        limit: parseInt(limite),
        offset,
        order: [['id', 'ASC']]
      });

      const totalPaginas = Math.ceil(count / parseInt(limite));

      return res.status(200).json({
        roles: rows,
        total: count,
        totalPaginas,
        paginaActual: parseInt(pagina),
        paginaSiguiente: parseInt(pagina) < totalPaginas ? parseInt(pagina) + 1 : null,
        paginaAnterior: parseInt(pagina) > 1 ? parseInt(pagina) - 1 : null
      });

    } catch (error) {
      console.error('Error al buscar roles:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

const { roles: Rol } = require('../models');
const { roles_permisos, permisos, usuarios: Usuario } = require('../models');
const { Op } = require('sequelize');
const response = require('../utils/responseHandler');

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

    response.success(res, {
      total: count,
      page: parseInt(page),
      size: limit,
      roles: rows
    });
  } catch (error) {
    console.error('Error al obtener roles:', error);
    response.error(res, error, 'Error al obtener roles');
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
        return response.error(res, {}, 'Rol no encontrado', 404);
      }

      response.success(res, {
        id: rol.id,
        nombre: rol.nombre,
        estado: rol.estado,
        permisos: rol.permisos_asociados
      });
    } catch (error) {
      console.error('Error al obtener detalles del rol:', error);
      response.error(res, error, 'Error interno del servidor');
    }
  },

  async crearRol(req, res) {
    try {
      const { nombre, permisos_ids } = req.body;

      if (!nombre || !Array.isArray(permisos_ids)) {
        return response.error(res, {}, 'Nombre y lista de permisos son requeridos', 400);
      }

      // Validar que no exista un rol con el mismo nombre
      const existente = await Rol.findOne({ where: { nombre } });
      if (existente) {
        return response.error(res, {}, 'Ya existe un rol con ese nombre', 400);
      }

      const nuevoRol = await Rol.create({ nombre });

      const asociaciones = permisos_ids.map(idPermiso => ({
        rol_id: nuevoRol.id,
        permiso_id: idPermiso
      }));

      await roles_permisos.bulkCreate(asociaciones);

      response.success(res, nuevoRol, 'Rol creado con éxito', 201);
    } catch (error) {
      console.error('Error al crear el rol:', error);
      response.error(res, error, 'Error al crear el rol');
    }
  },

  async editarRol(req, res) {
    const { id } = req.params;
    const { nombre, permisos: nuevosPermisos } = req.body;

    try {
      if (parseInt(id) === 1) {
        return response.error(res, {}, 'No se puede editar el rol Administrador', 403);
      }
      const rolEncontrado = await Rol.findByPk(id);
      if (!rolEncontrado) {
        return response.error(res, {}, 'Rol no encontrado', 404);
      }

      // Validar que no exista otro rol con el mismo nombre
      if (nombre) {
        const existente = await Rol.findOne({ where: { nombre, id: { [Op.ne]: id } } });
        if (existente) {
          return response.error(res, {}, 'Ya existe un rol con ese nombre', 400);
        }
        rolEncontrado.nombre = nombre;
      }
      await rolEncontrado.save();

      if (Array.isArray(nuevosPermisos)) {
        await roles_permisos.destroy({ where: { rol_id: id } });

        const permisosAInsertar = nuevosPermisos.map(idPermiso => ({
          rol_id: id,
          permiso_id: idPermiso
        }));

        await roles_permisos.bulkCreate(permisosAInsertar);
      }

      response.success(res, {}, 'Rol actualizado correctamente');
    } catch (error) {
      console.error('Error al editar el rol:', error);
      response.error(res, error, 'Error al editar el rol');
    }
  },

  async eliminarRol(req, res) {
    const { id } = req.params;

    try {
      if (parseInt(id) === 1) {
        return response.error(res, {}, 'No se puede eliminar el rol Administrador', 403);
      }
      const rolEncontrado = await Rol.findByPk(id);
      if (!rolEncontrado) {
        return response.error(res, {}, 'Rol no encontrado', 404);
      }

      const usuariosConRol = await Usuario.count({ where: { rol_id: id } });
      if (usuariosConRol > 0) {
        return response.error(res, {}, 'No se puede eliminar el rol porque tiene usuarios asociados', 400);
      }

      await roles_permisos.destroy({ where: { rol_id: id } });
      await Rol.destroy({ where: { id } });

      response.success(res, {}, 'Rol y sus permisos asociados eliminados con éxito');
    } catch (error) {
      console.error('Error al eliminar el rol:', error);
      response.error(res, error, 'Error al eliminar el rol');
    }
  },

  async cambiarEstadoRol(req, res) {
    const { id } = req.params;
    const { estado } = req.body;

    if (typeof estado !== 'boolean') {
      return response.error(res, {}, 'El estado debe ser un valor booleano (true/false)', 400);
    }

    try {
      const rolEncontrado = await Rol.findByPk(id);
      if (!rolEncontrado) return response.error(res, {}, 'Rol no encontrado', 404);

      rolEncontrado.estado = estado;
      await rolEncontrado.save();

      response.success(res, { estado: rolEncontrado.estado }, 'Estado del rol actualizado');
    } catch (error) {
      console.error(error);
      response.error(res, error, 'Error al cambiar estado del rol');
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

      response.success(res, {
        roles: rows,
        total: count,
        totalPaginas,
        paginaActual: parseInt(pagina),
        paginaSiguiente: parseInt(pagina) < totalPaginas ? parseInt(pagina) + 1 : null,
        paginaAnterior: parseInt(pagina) > 1 ? parseInt(pagina) - 1 : null
      });

    } catch (error) {
      console.error('Error al buscar roles:', error);
      response.error(res, error, 'Error interno del servidor');
    }
  }
};

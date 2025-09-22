const { salones } = require('../models');
const response = require('../utils/responseHandler');

// Obtener todos los salones
exports.obtenerSalones = async (req, res) => {
  try {
    if (req.query.all === 'true') {
      const lista = await salones.findAll({ order: [['nombre', 'ASC']] });
      return response.success(res, lista);
    }
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = 5;
    const offset = (pagina - 1) * limite;
    const { count, rows } = await salones.findAndCountAll({
      limit: limite,
      offset: offset,
      order: [['nombre', 'ASC']]
    });
    const totalPaginas = Math.ceil(count / limite);
    response.success(res, {
      salones: rows,
      totalSalones: count,
      totalPaginas,
      paginaActual: pagina
    });
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener los salones');
  }
};

// Crear un nuevo salón
exports.crearSalon = async (req, res) => {
  const { nombre } = req.body;
  try {
    if (!nombre) {
      return response.error(res, {}, 'El nombre es obligatorio', 400);
    }
    const nuevo = await salones.create({ nombre });
    response.success(res, nuevo, 'Salón creado', 201);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al crear el salón');
  }
};

// Obtener salón por ID
exports.obtenerSalonPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const salon = await salones.findByPk(id);
    if (!salon) {
      return response.error(res, {}, 'Salón no encontrado', 404);
    }
    response.success(res, salon);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener el salón');
  }
};

// Actualizar salón
exports.actualizarSalon = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const salon = await salones.findByPk(id);
    if (!salon) {
      return response.error(res, {}, 'Salón no encontrado', 404);
    }
    await salon.update({ nombre });
    response.success(res, salon, 'Salón actualizado');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al actualizar el salón');
  }
};

// Eliminar salón
exports.eliminarSalon = async (req, res) => {
  const { id } = req.params;
  try {
    const salon = await salones.findByPk(id);
    if (!salon) {
      return response.error(res, {}, 'Salón no encontrado', 404);
    }
    await salon.destroy();
    response.success(res, {}, 'Salón eliminado');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al eliminar el salón');
  }
};

// Cambiar estado de un salón
exports.cambiarEstadoSalon = async (req, res) => {
  const { id } = req.params;
  try {
    const salon = await salones.findByPk(id);
    if (!salon) {
      return response.error(res, {}, 'Salón no encontrado', 404);
    }
    salon.estado = !salon.estado;
    await salon.save();
    response.success(res, salon, 'Estado del salón actualizado');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al cambiar el estado del salón');
  }
}; 
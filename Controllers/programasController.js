const { programas } = require('../models');
const response = require('../utils/responseHandler');

// Obtener todos los programas
exports.obtenerProgramas = async (req, res) => {
  try {
    const lista = await programas.findAll({ order: [['nombre', 'ASC']] });
    response.success(res, lista);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener los programas');
  }
};

// Crear un nuevo programa
exports.crearPrograma = async (req, res) => {
  const { nombre } = req.body;
  try {
    if (!nombre) {
      return response.error(res, {}, 'El nombre es obligatorio', 400);
    }
    const nuevo = await programas.create({ nombre });
    response.success(res, nuevo, 'Programa creado', 201);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al crear el programa');
  }
};

// Obtener programa por ID
exports.obtenerProgramaPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const programa = await programas.findByPk(id);
    if (!programa) {
      return response.error(res, {}, 'Programa no encontrado', 404);
    }
    response.success(res, programa);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener el programa');
  }
};

// Actualizar programa
exports.actualizarPrograma = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const programa = await programas.findByPk(id);
    if (!programa) {
      return response.error(res, {}, 'Programa no encontrado', 404);
    }
    await programa.update({ nombre });
    response.success(res, programa, 'Programa actualizado');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al actualizar el programa');
  }
};

// Eliminar programa
exports.eliminarPrograma = async (req, res) => {
  const { id } = req.params;
  try {
    const programa = await programas.findByPk(id);
    if (!programa) {
      return response.error(res, {}, 'Programa no encontrado', 404);
    }
    await programa.destroy();
    response.success(res, {}, 'Programa eliminado');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al eliminar el programa');
  }
}; 
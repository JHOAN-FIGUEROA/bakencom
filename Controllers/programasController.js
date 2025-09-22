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
  const { nombre, duracion, modalidad, descripcion, estado } = req.body;
  try {
    // Validaciones mínimas
    if (!nombre) {
      return response.error(res, {}, 'El nombre es obligatorio', 400);
    }
    if (!duracion) {
      return response.error(res, {}, 'La duración es obligatoria', 400);
    }
    if (!modalidad) {
      return response.error(res, {}, 'La modalidad es obligatoria', 400);
    }

    const payload = {
      nombre,
      duracion,
      modalidad,
      descripcion: descripcion ?? null,
      // si no viene estado, dejar que el default del modelo (true) aplique
      ...(estado !== undefined ? { estado: !!estado } : {})
    };

    const nuevo = await programas.create(payload);
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
  const { nombre, duracion, modalidad, descripcion, estado } = req.body;
  try {
    const programa = await programas.findByPk(id);
    if (!programa) {
      return response.error(res, {}, 'Programa no encontrado', 404);
    }

    // Actualización parcial: solo los campos enviados
    const updateFields = {};
    if (nombre !== undefined) updateFields.nombre = nombre;
    if (duracion !== undefined) updateFields.duracion = duracion;
    if (modalidad !== undefined) updateFields.modalidad = modalidad;
    if (descripcion !== undefined) updateFields.descripcion = descripcion;
    if (estado !== undefined) updateFields.estado = !!estado;

    await programa.update(updateFields);
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
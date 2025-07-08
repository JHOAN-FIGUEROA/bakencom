const { grupos, estudiantes, clases } = require('../models');
const response = require('../utils/responseHandler');

// Obtener todos los grupos
exports.obtenerGrupos = async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const offset = (pagina - 1) * limite;

    const { count, rows } = await grupos.findAndCountAll({
      include: [
        { 
          model: estudiantes, 
          as: 'estudiantes',
          through: { attributes: [] }
        },
        { model: clases, as: 'clases' }
      ],
      limit: limite,
      offset: offset,
      order: [['nombre', 'ASC']]
    });

    const totalPaginas = Math.ceil(count / limite);

    response.success(res, {
      grupos: rows,
      totalGrupos: count,
      totalPaginas,
      paginaActual: pagina
    });
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener los grupos');
  }
};

// Crear un nuevo grupo
exports.crearGrupo = async (req, res) => {
  const { nombre } = req.body;

  try {
    const nuevoGrupo = await grupos.create({ nombre });

    const grupoConRelaciones = await grupos.findByPk(nuevoGrupo.id, {
      include: [
        { 
          model: estudiantes, 
          as: 'estudiantes',
          through: { attributes: [] }
        },
        { model: clases, as: 'clases' }
      ]
    });

    response.success(res, grupoConRelaciones, 'Grupo creado', 201);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al crear el grupo');
  }
};

// Obtener grupo por ID
exports.obtenerGrupoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const grupo = await grupos.findByPk(id, {
      include: [
        { 
          model: estudiantes, 
          as: 'estudiantes',
          through: { attributes: [] }
        },
        { model: clases, as: 'clases' }
      ]
    });

    if (!grupo) {
      return response.error(res, {}, 'Grupo no encontrado', 404);
    }

    response.success(res, grupo);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener el grupo');
  }
};

// Actualizar grupo
exports.actualizarGrupo = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  try {
    const grupo = await grupos.findByPk(id);
    if (!grupo) {
      return response.error(res, {}, 'Grupo no encontrado', 404);
    }

    await grupo.update({ nombre });

    response.success(res, grupo, 'Grupo actualizado correctamente');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al actualizar el grupo');
  }
};

// Eliminar grupo
exports.eliminarGrupo = async (req, res) => {
  const { id } = req.params;

  try {
    const grupo = await grupos.findByPk(id);
    if (!grupo) {
      return response.error(res, {}, 'Grupo no encontrado', 404);
    }

    await grupo.destroy();
    response.success(res, {}, 'Grupo eliminado correctamente');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al eliminar el grupo');
  }
};

// Obtener estudiantes de un grupo
exports.obtenerEstudiantesDelGrupo = async (req, res) => {
  const { id } = req.params;

  try {
    const grupo = await grupos.findByPk(id, {
      include: [
        { 
          model: estudiantes, 
          as: 'estudiantes',
          through: { attributes: [] }
        }
      ]
    });

    if (!grupo) {
      return response.error(res, {}, 'Grupo no encontrado', 404);
    }

    response.success(res, grupo.estudiantes);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener estudiantes del grupo');
  }
};

// Obtener clases de un grupo
exports.obtenerClasesDelGrupo = async (req, res) => {
  const { id } = req.params;

  try {
    const grupo = await grupos.findByPk(id, {
      include: [
        { model: clases, as: 'clases' }
      ]
    });

    if (!grupo) {
      return response.error(res, {}, 'Grupo no encontrado', 404);
    }

    response.success(res, grupo.clases);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener clases del grupo');
  }
}; 
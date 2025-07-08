const { estudiante_grupo, estudiantes, grupos } = require('../models');
const response = require('../utils/responseHandler');

// Asignar estudiante a un grupo
exports.asignarEstudianteAGrupo = async (req, res) => {
  const { estudiante_id, grupo_id } = req.body;

  try {
    // Verificar que el estudiante existe
    const estudiante = await estudiantes.findByPk(estudiante_id);
    if (!estudiante) {
      return response.error(res, {}, 'Estudiante no encontrado', 404);
    }

    // Verificar que el grupo existe
    const grupo = await grupos.findByPk(grupo_id);
    if (!grupo) {
      return response.error(res, {}, 'Grupo no encontrado', 404);
    }

    // Crear la relación
    const nuevaAsignacion = await estudiante_grupo.create({
      estudiante_id,
      grupo_id
    });

    response.success(res, nuevaAsignacion, 'Estudiante asignado al grupo correctamente', 201);
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return response.error(res, error, 'El estudiante ya está asignado a este grupo', 400);
    }
    response.error(res, error, 'Error al asignar estudiante al grupo');
  }
};

// Remover estudiante de un grupo
exports.removerEstudianteDeGrupo = async (req, res) => {
  const { estudiante_id, grupo_id } = req.params;

  try {
    const asignacion = await estudiante_grupo.findOne({
      where: { estudiante_id, grupo_id }
    });

    if (!asignacion) {
      return response.error(res, {}, 'Asignación no encontrada', 404);
    }

    await asignacion.destroy();
    response.success(res, {}, 'Estudiante removido del grupo correctamente');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al remover estudiante del grupo');
  }
};

// Obtener todas las asignaciones
exports.obtenerAsignaciones = async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const offset = (pagina - 1) * limite;

    const { count, rows } = await estudiante_grupo.findAndCountAll({
      include: [
        { model: estudiantes, as: 'estudiante' },
        { model: grupos, as: 'grupo' }
      ],
      limit: limite,
      offset: offset,
      order: [['id', 'ASC']]
    });

    const totalPaginas = Math.ceil(count / limite);

    response.success(res, {
      asignaciones: rows,
      totalAsignaciones: count,
      totalPaginas,
      paginaActual: pagina
    });
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener las asignaciones');
  }
};

// Obtener grupos de un estudiante
exports.obtenerGruposDeEstudiante = async (req, res) => {
  const { estudiante_id } = req.params;

  try {
    const gruposEstudiante = await estudiante_grupo.findAll({
      where: { estudiante_id },
      include: [
        { model: grupos, as: 'grupo' }
      ]
    });

    response.success(res, gruposEstudiante);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener grupos del estudiante');
  }
};

// Obtener estudiantes de un grupo
exports.obtenerEstudiantesDeGrupo = async (req, res) => {
  const { grupo_id } = req.params;

  try {
    const estudiantesGrupo = await estudiante_grupo.findAll({
      where: { grupo_id },
      include: [
        { model: estudiantes, as: 'estudiante' }
      ]
    });

    response.success(res, estudiantesGrupo);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener estudiantes del grupo');
  }
}; 
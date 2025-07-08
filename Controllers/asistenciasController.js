const { asistencias, clases, estudiantes } = require('../models');
const response = require('../utils/responseHandler');

// Obtener todas las asistencias
exports.obtenerAsistencias = async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const offset = (pagina - 1) * limite;

    const { count, rows } = await asistencias.findAndCountAll({
      include: [
        { model: clases, as: 'clase' },
        { model: estudiantes, as: 'estudiante' }
      ],
      limit: limite,
      offset: offset,
      order: [['fecha', 'DESC']]
    });

    const totalPaginas = Math.ceil(count / limite);

    response.success(res, {
      asistencias: rows,
      totalAsistencias: count,
      totalPaginas,
      paginaActual: pagina
    });
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener las asistencias');
  }
};

// Crear una nueva asistencia
exports.crearAsistencia = async (req, res) => {
  const { clase_id, estudiante_id, fecha, presente } = req.body;

  try {
    const nuevaAsistencia = await asistencias.create({
      clase_id,
      estudiante_id,
      fecha,
      presente: presente || false
    });

    const asistenciaConRelaciones = await asistencias.findByPk(nuevaAsistencia.id, {
      include: [
        { model: clases, as: 'clase' },
        { model: estudiantes, as: 'estudiante' }
      ]
    });

    response.success(res, asistenciaConRelaciones, 'Asistencia creada', 201);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al crear la asistencia');
  }
};

// Obtener asistencia por ID
exports.obtenerAsistenciaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const asistencia = await asistencias.findByPk(id, {
      include: [
        { model: clases, as: 'clase' },
        { model: estudiantes, as: 'estudiante' }
      ]
    });

    if (!asistencia) {
      return response.error(res, {}, 'Asistencia no encontrada', 404);
    }

    response.success(res, asistencia);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener la asistencia');
  }
};

// Actualizar asistencia
exports.actualizarAsistencia = async (req, res) => {
  const { id } = req.params;
  const { clase_id, estudiante_id, fecha, presente } = req.body;

  try {
    const asistencia = await asistencias.findByPk(id);
    if (!asistencia) {
      return response.error(res, {}, 'Asistencia no encontrada', 404);
    }

    await asistencia.update({ clase_id, estudiante_id, fecha, presente });

    response.success(res, asistencia, 'Asistencia actualizada correctamente');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al actualizar la asistencia');
  }
};

// Eliminar asistencia
exports.eliminarAsistencia = async (req, res) => {
  const { id } = req.params;

  try {
    const asistencia = await asistencias.findByPk(id);
    if (!asistencia) {
      return response.error(res, {}, 'Asistencia no encontrada', 404);
    }

    await asistencia.destroy();
    response.success(res, {}, 'Asistencia eliminada correctamente');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al eliminar la asistencia');
  }
};

// Obtener asistencias por clase
exports.obtenerAsistenciasPorClase = async (req, res) => {
  const { clase_id } = req.params;
  const { fecha } = req.query;

  try {
    const whereClause = { clase_id };
    if (fecha) {
      whereClause.fecha = fecha;
    }

    const asistenciasClase = await asistencias.findAll({
      where: whereClause,
      include: [
        { model: clases, as: 'clase' },
        { model: estudiantes, as: 'estudiante' }
      ],
      order: [['fecha', 'DESC']]
    });

    response.success(res, asistenciasClase);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener las asistencias de la clase');
  }
};

// Obtener asistencias por estudiante
exports.obtenerAsistenciasPorEstudiante = async (req, res) => {
  const { estudiante_id } = req.params;

  try {
    const asistenciasEstudiante = await asistencias.findAll({
      where: { estudiante_id },
      include: [
        { model: clases, as: 'clase' },
        { model: estudiantes, as: 'estudiante' }
      ],
      order: [['fecha', 'DESC']]
    });

    response.success(res, asistenciasEstudiante);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener las asistencias del estudiante');
  }
}; 
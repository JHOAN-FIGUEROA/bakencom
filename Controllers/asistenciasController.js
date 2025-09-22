const { asistencias, clases, estudiantes, grupos, profesores, salones } = require('../models');
const response = require('../utils/responseHandler');

// Obtener todas las asistencias
exports.obtenerAsistencias = async (req, res) => {
  try {
    if (req.query.all === 'true') {
      const lista = await asistencias.findAll({
        include: [
          { model: clases, as: 'clase' },
          { model: estudiantes, as: 'estudiante' }
        ],
        order: [['fecha', 'DESC']]
      });
      return response.success(res, lista);
    }
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = 5;
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

// Verificar si ya existe asistencia para una clase en una fecha
exports.verificarAsistenciaExistente = async (req, res) => {
  const { clase_id } = req.params;
  const { fecha } = req.query;

  try {
    const fechaConsulta = fecha || new Date().toISOString().slice(0, 10);
    
    const asistenciasExistentes = await asistencias.findAll({
      where: {
        clase_id,
        fecha: fechaConsulta
      },
      include: [
        { model: estudiantes, as: 'estudiante' }
      ]
    });

    // Eliminar duplicados por estudiante (tomar el último registro)
    const asistenciasUnicas = [];
    const estudiantesVistos = new Set();
    
    // Recorrer en orden inverso para tomar el último registro de cada estudiante
    for (let i = asistenciasExistentes.length - 1; i >= 0; i--) {
      const asistencia = asistenciasExistentes[i];
      if (!estudiantesVistos.has(asistencia.estudiante_id)) {
        estudiantesVistos.add(asistencia.estudiante_id);
        asistenciasUnicas.unshift(asistencia); // Agregar al inicio para mantener orden
      }
    }

    const resumen = {
      existe_asistencia: asistenciasUnicas.length > 0,
      fecha: fechaConsulta,
      total_registros: asistenciasUnicas.length,
      presentes: asistenciasUnicas.filter(a => a.presente).length,
      ausentes: asistenciasUnicas.filter(a => !a.presente).length,
      estudiantes: asistenciasUnicas.map(a => ({
        documento: a.estudiante_id,
        nombre: a.estudiante ? `${a.estudiante.nombre} ${a.estudiante.apellido}` : 'N/A',
        presente: a.presente
      }))
    };

    response.success(res, resumen);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al verificar asistencia existente');
  }
};

// Obtener asistencias por clase
exports.obtenerAsistenciasPorClase = async (req, res) => {
  const { clase_id } = req.params;

  try {
    const asistenciasClase = await asistencias.findAll({
      where: { clase_id },
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

// Crear una nueva asistencia
exports.crearAsistencia = async (req, res) => {
  const { clase_id, estudiante_id, fecha, presente } = req.body;

  try {
    // Verificar si ya existe una asistencia para esta combinación
    const asistenciaExistente = await asistencias.findOne({
      where: {
        clase_id,
        estudiante_id,
        fecha
      }
    });

    let asistenciaFinal;
    
    if (asistenciaExistente) {
      // Si existe, actualizar el estado
      await asistenciaExistente.update({
        presente: presente !== undefined ? presente : false
      });
      asistenciaFinal = asistenciaExistente;
    } else {
      // Si no existe, crear nueva
      asistenciaFinal = await asistencias.create({
        clase_id,
        estudiante_id,
        fecha,
        presente: presente !== undefined ? presente : false
      });
    }

    const asistenciaConRelaciones = await asistencias.findByPk(asistenciaFinal.id, {
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
        { 
          model: clases, 
          as: 'clase',
          include: [
            { model: grupos, as: 'grupo' },
            { model: profesores, as: 'profesor' },
            { model: salones, as: 'salon' }
          ]
        },
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
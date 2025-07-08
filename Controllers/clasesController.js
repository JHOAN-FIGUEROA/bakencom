const { clases, grupos, profesores, asistencias } = require('../models');
const response = require('../utils/responseHandler');

// Obtener todas las clases
exports.obtenerClases = async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const offset = (pagina - 1) * limite;

    const { count, rows } = await clases.findAndCountAll({
      include: [
        { model: grupos, as: 'grupo' },
        { model: profesores, as: 'profesor' }
      ],
      limit: limite,
      offset: offset,
      order: [['nombre', 'ASC']]
    });

    const totalPaginas = Math.ceil(count / limite);

    response.success(res, {
      clases: rows,
      totalClases: count,
      totalPaginas,
      paginaActual: pagina
    });
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener las clases');
  }
};

// Crear una nueva clase
exports.crearClase = async (req, res) => {
  const { nombre, semestre, grupo_id, profesor_id, dia_semana, hora_inicio, hora_fin } = req.body;

  try {
    const nuevaClase = await clases.create({
      nombre,
      semestre,
      grupo_id,
      profesor_id,
      dia_semana,
      hora_inicio,
      hora_fin
    });

    const claseConRelaciones = await clases.findByPk(nuevaClase.id, {
      include: [
        { model: grupos, as: 'grupo' },
        { model: profesores, as: 'profesor' }
      ]
    });

    response.success(res, claseConRelaciones, 'Clase creada', 201);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al crear la clase');
  }
};

// Obtener clase por ID
exports.obtenerClasePorId = async (req, res) => {
  const { id } = req.params;

  try {
    const clase = await clases.findByPk(id, {
      include: [
        { model: grupos, as: 'grupo' },
        { model: profesores, as: 'profesor' }
      ]
    });

    if (!clase) {
      return response.error(res, {}, 'Clase no encontrada', 404);
    }

    response.success(res, clase);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener la clase');
  }
};

// Actualizar clase
exports.actualizarClase = async (req, res) => {
  const { id } = req.params;
  const { nombre, semestre, grupo_id, profesor_id, dia_semana, hora_inicio, hora_fin } = req.body;

  try {
    const clase = await clases.findByPk(id);
    if (!clase) {
      return response.error(res, {}, 'Clase no encontrada', 404);
    }

    await clase.update({ nombre, semestre, grupo_id, profesor_id, dia_semana, hora_inicio, hora_fin });

    response.success(res, clase, 'Clase actualizada correctamente');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al actualizar la clase');
  }
};

// Eliminar clase
exports.eliminarClase = async (req, res) => {
  const { id } = req.params;

  try {
    const clase = await clases.findByPk(id);
    if (!clase) {
      return response.error(res, {}, 'Clase no encontrada', 404);
    }

    await clase.destroy();
    response.success(res, {}, 'Clase eliminada correctamente');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al eliminar la clase');
  }
};

// Obtener clases por grupo
exports.obtenerClasesPorGrupo = async (req, res) => {
  const { grupo_id } = req.params;

  try {
    const clasesGrupo = await clases.findAll({
      where: { grupo_id },
      include: [
        { model: grupos, as: 'grupo' },
        { model: profesores, as: 'profesor' }
      ],
      order: [['nombre', 'ASC']]
    });

    response.success(res, clasesGrupo);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener las clases del grupo');
  }
};

// Obtener clases por profesor
exports.obtenerClasesPorProfesor = async (req, res) => {
  const { profesor_id } = req.params;

  try {
    const clasesProfesor = await clases.findAll({
      where: { profesor_id },
      include: [
        { model: grupos, as: 'grupo' },
        { model: profesores, as: 'profesor' }
      ],
      order: [['nombre', 'ASC']]
    });

    response.success(res, clasesProfesor);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener las clases del profesor');
  }
};

// Obtener clases por día de la semana
exports.obtenerClasesPorDia = async (req, res) => {
  const { dia_semana } = req.params;

  try {
    const clasesDia = await clases.findAll({
      where: { dia_semana },
      include: [
        { model: grupos, as: 'grupo' },
        { model: profesores, as: 'profesor' }
      ],
      order: [['hora_inicio', 'ASC']]
    });

    response.success(res, clasesDia);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener las clases del día');
  }
}; 
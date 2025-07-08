const { estudiantes, estudiante_grupo, grupos, asistencias } = require('../models');
const { Op } = require('sequelize');
const response = require('../utils/responseHandler');

// Obtener todos los estudiantes
exports.obtenerEstudiantes = async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const offset = (pagina - 1) * limite;

    const { count, rows } = await estudiantes.findAndCountAll({
      include: [
        { 
          model: grupos, 
          as: 'grupos',
          through: { attributes: [] }
        }
      ],
      limit: limite,
      offset: offset,
      order: [['nombre', 'ASC']]
    });

    const totalPaginas = Math.ceil(count / limite);

    response.success(res, {
      estudiantes: rows,
      totalEstudiantes: count,
      totalPaginas,
      paginaActual: pagina
    });
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener los estudiantes');
  }
};

// Crear un nuevo estudiante
exports.crearEstudiante = async (req, res) => {
  const { 
    numerofolio, 
    tipo_documento, 
    documento, 
    nombre, 
    apellido, 
    fecha_nacimiento, 
    departamento, 
    Municipio, 
    direccion, 
    programa, 
    telefono, 
    horario_programa, 
    eps, 
    observaciones, 
    foto, 
    rh 
  } = req.body;

  try {
    const nuevoEstudiante = await estudiantes.create({
      numerofolio,
      tipo_documento,
      documento,
      nombre,
      apellido,
      fecha_nacimiento,
      departamento,
      Municipio,
      direccion,
      programa,
      telefono,
      horario_programa,
      eps,
      observaciones,
      foto,
      rh
    });

    const estudianteConGrupos = await estudiantes.findByPk(nuevoEstudiante.documento, {
      include: [
        { 
          model: grupos, 
          as: 'grupos',
          through: { attributes: [] }
        }
      ]
    });

    response.success(res, estudianteConGrupos, 'Estudiante creado', 201);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al crear el estudiante');
  }
};

// Obtener estudiante por documento
exports.obtenerEstudiantePorDocumento = async (req, res) => {
  const { documento } = req.params;

  try {
    const estudiante = await estudiantes.findByPk(documento, {
      include: [
        { 
          model: grupos, 
          as: 'grupos',
          through: { attributes: [] }
        }
      ]
    });

    if (!estudiante) {
      return response.error(res, {}, 'Estudiante no encontrado', 404);
    }

    response.success(res, estudiante);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener el estudiante');
  }
};

// Actualizar estudiante
exports.actualizarEstudiante = async (req, res) => {
  const { documento } = req.params;
  const { 
    numerofolio, 
    tipo_documento, 
    nombre, 
    apellido, 
    fecha_nacimiento, 
    departamento, 
    Municipio, 
    direccion, 
    programa, 
    telefono, 
    horario_programa, 
    eps, 
    observaciones, 
    foto, 
    rh 
  } = req.body;

  try {
    const estudiante = await estudiantes.findByPk(documento);
    if (!estudiante) {
      return response.error(res, {}, 'Estudiante no encontrado', 404);
    }

    await estudiante.update({ 
      numerofolio, 
      tipo_documento, 
      nombre, 
      apellido, 
      fecha_nacimiento, 
      departamento, 
      Municipio, 
      direccion, 
      programa, 
      telefono, 
      horario_programa, 
      eps, 
      observaciones, 
      foto, 
      rh 
    });

    response.success(res, estudiante, 'Estudiante actualizado correctamente');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al actualizar el estudiante');
  }
};

// Eliminar estudiante
exports.eliminarEstudiante = async (req, res) => {
  const { documento } = req.params;

  try {
    const estudiante = await estudiantes.findByPk(documento);
    if (!estudiante) {
      return response.error(res, {}, 'Estudiante no encontrado', 404);
    }

    await estudiante.destroy();
    response.success(res, {}, 'Estudiante eliminado correctamente');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al eliminar el estudiante');
  }
};

// Buscar estudiantes por nombre o apellido
exports.buscarEstudiantes = async (req, res) => {
  const { q } = req.query;

  try {
    const estudiantesEncontrados = await estudiantes.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${q}%` } },
          { apellido: { [Op.iLike]: `%${q}%` } },
          { documento: { [Op.iLike]: `%${q}%` } }
        ]
      },
      include: [
        { 
          model: grupos, 
          as: 'grupos',
          through: { attributes: [] }
        }
      ],
      order: [['nombre', 'ASC']]
    });

    response.success(res, estudiantesEncontrados);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al buscar estudiantes');
  }
};

// Obtener estudiantes por programa
exports.obtenerEstudiantesPorPrograma = async (req, res) => {
  const { programa } = req.params;

  try {
    const estudiantesPrograma = await estudiantes.findAll({
      where: { programa },
      include: [
        { 
          model: grupos, 
          as: 'grupos',
          through: { attributes: [] }
        }
      ],
      order: [['nombre', 'ASC']]
    });

    response.success(res, estudiantesPrograma);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener estudiantes del programa');
  }
};

// Obtener estudiantes por departamento
exports.obtenerEstudiantesPorDepartamento = async (req, res) => {
  const { departamento } = req.params;

  try {
    const estudiantesDepartamento = await estudiantes.findAll({
      where: { departamento },
      include: [
        { 
          model: grupos, 
          as: 'grupos',
          through: { attributes: [] }
        }
      ],
      order: [['nombre', 'ASC']]
    });

    response.success(res, estudiantesDepartamento);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener estudiantes del departamento');
  }
}; 
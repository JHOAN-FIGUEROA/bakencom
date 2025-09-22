const { estudiantes, estudiante_grupo, grupos, asistencias, programas } = require('../models');
const { Op } = require('sequelize');
const response = require('../utils/responseHandler');

// Obtener todos los estudiantes
exports.obtenerEstudiantes = async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 5;
    const offset = (pagina - 1) * limite;

    const { count, rows } = await estudiantes.findAndCountAll({
      include: [
        { 
          model: grupos, 
          as: 'grupos',
          through: { attributes: [] }
        },
        {
          model: programas,
          as: 'programas',
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
    email,
    nombre, 
    apellido, 
    fecha_nacimiento, 
    departamento, 
    Municipio, 
    direccion, 
    telefono, 
    horario_programa, 
    eps, 
    observaciones, 
    foto, 
    rh, 
    programas: programasIds // array de IDs de programas
  } = req.body;

  // Validar email obligatorio y formato
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return response.error(res, {}, 'El correo electrónico es obligatorio y debe tener un formato válido', 400);
  }

  // Validar email único
  const emailExistente = await estudiantes.findOne({ where: { email } });
  if (emailExistente) {
    return response.error(res, {}, 'Ya existe un estudiante con ese correo electrónico', 400);
  }

  try {
    const nuevoEstudiante = await estudiantes.create({
      numerofolio,
      tipo_documento,
      documento,
      email,
      nombre,
      apellido,
      fecha_nacimiento,
      departamento,
      Municipio,
      direccion,
      telefono,
      horario_programa,
      eps,
      observaciones,
      foto,
      rh,
      estado: true // Siempre activo al crear
    });

    // Asociar programas si se envían
    if (Array.isArray(programasIds) && programasIds.length > 0) {
      await nuevoEstudiante.setProgramas(programasIds);
    }

    const estudianteConRelaciones = await estudiantes.findByPk(nuevoEstudiante.documento, {
      include: [
        { model: grupos, as: 'grupos', through: { attributes: [] } },
        { model: programas, as: 'programas', through: { attributes: [] } }
      ]
    });

    response.success(res, estudianteConRelaciones, 'Estudiante creado', 201);
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
        },
        {
          model: programas,
          as: 'programas',
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
    email,
    fecha_nacimiento, 
    departamento, 
    Municipio, 
    direccion, 
    telefono, 
    horario_programa, 
    eps, 
    observaciones, 
    foto, 
    rh, 
    programas: programasIds // array de IDs de programas
  } = req.body;

  // Validar email obligatorio y formato
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return response.error(res, {}, 'El correo electrónico es obligatorio y debe tener un formato válido', 400);
  }

  // Validar email único (excluyendo el propio)
  const emailExistente = await estudiantes.findOne({ where: { email, documento: { [Op.ne]: documento } } });
  if (emailExistente) {
    return response.error(res, {}, 'Ya existe otro estudiante con ese correo electrónico', 400);
  }

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
      email,
      fecha_nacimiento, 
      departamento, 
      Municipio, 
      direccion, 
      telefono, 
      horario_programa, 
      eps, 
      observaciones, 
      foto, 
      rh 
    });

    // Actualizar programas asociados
    if (Array.isArray(programasIds)) {
      await estudiante.setProgramas(programasIds);
    }

    const estudianteConRelaciones = await estudiantes.findByPk(estudiante.documento, {
      include: [
        { model: grupos, as: 'grupos', through: { attributes: [] } },
        { model: programas, as: 'programas', through: { attributes: [] } }
      ]
    });

    response.success(res, estudianteConRelaciones, 'Estudiante actualizado correctamente');
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

// Cambiar el estado (activo/inactivo) del estudiante
exports.cambiarEstadoEstudiante = async (req, res) => {
  const { documento } = req.params;
  const { estado } = req.body; // true o false

  try {
    const estudiante = await estudiantes.findByPk(documento);
    if (!estudiante) {
      return response.error(res, {}, 'Estudiante no encontrado', 404);
    }

    await estudiante.update({ estado });

    response.success(res, { estadoActual: estudiante.estado }, 'Estado del estudiante actualizado correctamente');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al cambiar el estado del estudiante');
  }
}; 
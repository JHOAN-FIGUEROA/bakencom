const { profesores, usuarios, clases, roles } = require('../models');
const { Op } = require('sequelize');
const response = require('../utils/responseHandler');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Obtener todos los profesores
exports.obtenerProfesores = async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const offset = (pagina - 1) * limite;

    const { count, rows } = await profesores.findAndCountAll({
      include: [
        { model: usuarios, as: 'usuario' },
        { model: clases, as: 'clases' }
      ],
      limit: limite,
      offset: offset,
      order: [['nombre', 'ASC']]
    });

    const totalPaginas = Math.ceil(count / limite);

    response.success(res, {
      profesores: rows,
      totalProfesores: count,
      totalPaginas,
      paginaActual: pagina
    });
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener los profesores');
  }
};

// Crear un nuevo profesor
exports.crearProfesor = async (req, res) => {
  const { nombre, apellido, documento, email, especialidad, departamento, telefono, direccion } = req.body;

  try {
    // Validar si ya existe un usuario con el mismo documento o email
    const usuarioExistente = await usuarios.findOne({
      where: {
        [Op.or]: [
          { documento },
          { email }
        ]
      }
    });
    if (usuarioExistente) {
      return response.error(res, {}, 'Ya existe un usuario con ese documento o email', 400);
    }

    // Buscar el rol de profesor
    const rolProfesor = await roles.findOne({ where: { nombre: 'Profesor' } });
    if (!rolProfesor) {
      return response.error(res, {}, 'No existe el rol Profesor', 400);
    }

    // Generar una contraseña temporal (puedes cambiar esto por una lógica más segura)
    const contraseñaTemporal = documento;
    const hash = await bcrypt.hash(contraseñaTemporal, 10);

    // Crear el usuario asociado
    const nuevoUsuario = await usuarios.create({
      nombre,
      apellido,
      documento,
      email,
      contraseña: hash,
      rol_id: rolProfesor.id
    });

    // Crear el profesor y asociar el usuario, incluyendo los nuevos campos
    const nuevoProfesor = await profesores.create({
      nombre,
      apellido,
      documento,
      email,
      usuario_id: nuevoUsuario.id,
      especialidad,
      departamento,
      telefono,
      direccion
    });

    // Enviar correo de bienvenida con los datos de acceso
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '¡Bienvenido a Classlog  Profesor!',
        html: `
          <h2>¡Felicidades ${nombre} ${apellido}!</h2>
          <p>Has sido inscrito en <strong>Classlog</strong> como profesor.</p>
          <p>Ya puedes iniciar sesión en la plataforma con los siguientes datos:</p>
          <ul>
            <li><strong>Correo:</strong> ${email}</li>
            <li><strong>Contraseña temporal:</strong> ${contraseñaTemporal}</li>
          </ul>
          <p>Podrás cambiar tu contraseña en cualquier momento usando la opción de <strong>restablecer contraseña</strong> en la plataforma.</p>
          <p>¡Bienvenido a bordo!</p>
        `
      };
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.error('Error al enviar correo al profesor:', mailError);
    }

    const profesorConRelaciones = await profesores.findByPk(nuevoProfesor.id, {
      include: [
        { model: usuarios, as: 'usuario' },
        { model: clases, as: 'clases' }
      ]
    });

    response.success(res, profesorConRelaciones, 'Profesor y usuario creados', 201);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al crear el profesor');
  }
};

// Obtener profesor por ID
exports.obtenerProfesorPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const profesor = await profesores.findByPk(id, {
      include: [
        { model: usuarios, as: 'usuario' },
        { model: clases, as: 'clases' }
      ]
    });

    if (!profesor) {
      return response.error(res, {}, 'Profesor no encontrado', 404);
    }

    response.success(res, profesor);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener el profesor');
  }
};

// Obtener profesor por documento
exports.obtenerProfesorPorDocumento = async (req, res) => {
  const { documento } = req.params;

  try {
    const profesor = await profesores.findOne({
      where: { documento },
      include: [
        { model: usuarios, as: 'usuario' },
        { model: clases, as: 'clases' }
      ]
    });

    if (!profesor) {
      return response.error(res, {}, 'Profesor no encontrado', 404);
    }

    response.success(res, profesor);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener el profesor');
  }
};

// Actualizar profesor
exports.actualizarProfesor = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, documento, email, usuario_id, especialidad, departamento, telefono, direccion } = req.body;

  try {
    const profesor = await profesores.findByPk(id);
    if (!profesor) {
      return response.error(res, {}, 'Profesor no encontrado', 404);
    }

    // Validar si ya existe otro usuario con el mismo documento o email
    const usuarioExistente = await usuarios.findOne({
      where: {
        [Op.or]: [
          { documento },
          { email }
        ],
        id: { [Op.ne]: usuario_id || profesor.usuario_id }
      }
    });
    if (usuarioExistente) {
      return response.error(res, {}, 'Ya existe otro usuario con ese documento o email', 400);
    }

    await profesor.update({ nombre, apellido, documento, email, usuario_id, especialidad, departamento, telefono, direccion });

    response.success(res, profesor, 'Profesor actualizado correctamente');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al actualizar el profesor');
  }
};

// Eliminar profesor
exports.eliminarProfesor = async (req, res) => {
  const { id } = req.params;

  try {
    const profesor = await profesores.findByPk(id);
    if (!profesor) {
      return response.error(res, {}, 'Profesor no encontrado', 404);
    }

    await profesor.destroy();
    response.success(res, {}, 'Profesor eliminado correctamente');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al eliminar el profesor');
  }
};

// Buscar profesores por nombre o apellido
exports.buscarProfesores = async (req, res) => {
  const { q } = req.query;

  try {
    const profesoresEncontrados = await profesores.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${q}%` } },
          { apellido: { [Op.iLike]: `%${q}%` } },
          { documento: { [Op.iLike]: `%${q}%` } },
          { email: { [Op.iLike]: `%${q}%` } }
        ]
      },
      include: [
        { model: usuarios, as: 'usuario' },
        { model: clases, as: 'clases' }
      ],
      order: [['nombre', 'ASC']]
    });

    response.success(res, profesoresEncontrados);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al buscar profesores');
  }
};

// Obtener clases de un profesor
exports.obtenerClasesDelProfesor = async (req, res) => {
  const { id } = req.params;

  try {
    const profesor = await profesores.findByPk(id, {
      include: [
        { model: clases, as: 'clases' }
      ]
    });

    if (!profesor) {
      return response.error(res, {}, 'Profesor no encontrado', 404);
    }

    response.success(res, profesor.clases);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener clases del profesor');
  }
}; 
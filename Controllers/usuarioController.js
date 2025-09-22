const nodemailer = require('nodemailer');
const { usuarios, roles, permisos } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const response = require('../utils/responseHandler');

// Obtener todos los usuarios
exports.obtenerUsuarios = async (req, res) => {
  try {
    if (req.query.all === 'true') {
      const lista = await usuarios.findAll({
        include: [{ 
          model: roles, 
          as: 'rol',
          include: [{
            model: permisos,
            as: 'permisos_asociados',
            through: { attributes: [] }
          }]
        }],
        order: [['id', 'ASC']]
      });
      return response.success(res, lista);
    }
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = 5;
    const offset = (pagina - 1) * limite;
    const { count, rows } = await usuarios.findAndCountAll({
      include: [{ 
        model: roles, 
        as: 'rol',
        include: [{
          model: permisos,
          as: 'permisos_asociados',
          through: { attributes: [] }
        }]
      }],
      limit: limite,
      offset: offset,
      order: [['id', 'ASC']]
    });
    const totalPaginas = Math.ceil(count / limite);
    response.success(res, {
      usuarios: rows,
      totalUsuarios: count,
      totalPaginas,
      paginaActual: pagina
    });
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener los usuarios');
  }
};

// Crear un nuevo usuario (sin campo estado)
exports.crearUsuario = async (req, res) => {
  const { nombre, apellido, tipo_documento, documento, email, contraseña, rol_id } = req.body;

  if (!contraseña) {
    return response.error(res, {}, 'La contraseña es obligatoria', 400);
  }

  try {
    // Hashear contraseña
    const saltRounds = 10;
    const hash = await bcrypt.hash(contraseña, saltRounds);

    // Crear usuario
    const nuevoUsuario = await usuarios.create({
      nombre,
      apellido,
      tipo_documento,
      documento,
      email,
      contraseña: hash,
      rol_id
    });

    // Traer usuario con rol para enviar email
    const usuarioConRol = await usuarios.findByPk(nuevoUsuario.id, {
      include: [{ model: roles, as: 'rol' }]
    });

    // Configurar transporter Nodemailer (ejemplo con Gmail, ajusta según tu email SMTP)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,       // tu email
        pass: process.env.EMAIL_PASSWORD,   // tu password o app password
      }
    });

    // Definir contenido del correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Registro exitoso en la plataforma',
      html: `
        <h2>Hola ${nombre} ${apellido},</h2>
        <p>Tu registro fue exitoso en nuestra plataforma.</p>
        <p>Tu rol asignado es: <strong>${usuarioConRol.rol.nombre}</strong>.</p>
        <p>¡Gracias por registrarte!</p>
      `
    };

    // Enviar correo
    try {
      await transporter.sendMail(mailOptions);
      console.log('Correo enviado');
    } catch (mailError) {
      console.error('Error al enviar correo:', mailError);
    }
    
    // Responder con el usuario creado
    response.success(res, usuarioConRol, 'Usuario creado exitosamente', 201);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al crear el usuario');
  }
};

const JWT_SECRET = process.env.JWT_SECRET;

exports.login = async (req, res) => {
  const { email, contraseña } = req.body;

  // Validar que email y contraseña estén presentes
  if (!email || email.trim() === '') {
    return response.error(res, {}, 'El email es requerido', 400);
  }

  if (!contraseña || contraseña.trim() === '') {
    return response.error(res, {}, 'La contraseña es requerida', 400);
  }

  try {
    const usuario = await usuarios.findOne({
      where: { email },
      include: [{ 
        model: roles, 
        as: 'rol',
        include: [{
          model: permisos,
          as: 'permisos_asociados',
          through: { attributes: [] }
        }]
      }]
    });

    if (!usuario) {
      return response.error(res, {}, 'Credenciales inválidas', 401);
    }

    if (!usuario.rol) {
      return response.error(res, {}, 'Usuario sin rol asignado, no puede iniciar sesión', 403);
    }

    // Validar que el usuario tenga una contraseña almacenada
    if (!usuario.contraseña || usuario.contraseña.trim() === '') {
      return response.error(res, {}, 'Usuario sin contraseña configurada, contacte al administrador', 500);
    }

    const passwordValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!passwordValida) {
      return response.error(res, {}, 'Credenciales inválidas', 401);
    }

    const payload = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol.nombre
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    response.success(res, {
      token,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol
    }, 'Inicio de sesión exitoso');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error en el inicio de sesión');
  }
};

// Editar usuario (sin campo estado)
exports.actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, tipo_documento, documento, email, rol_id } = req.body;

  try {
    const usuario = await usuarios.findByPk(id);
    if (!usuario) {
      return response.error(res, {}, 'Usuario no encontrado', 404);
    }

    await usuario.update({ nombre, apellido, tipo_documento, documento, email, rol_id });

    response.success(res, usuario, 'Usuario actualizado correctamente');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al actualizar el usuario');
  }
};

exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  // Bloquear eliminación del usuario admin (id 10)
  if (parseInt(id) === 10) {
    return response.error(res, {}, 'No se puede eliminar el usuario administrador principal', 403);
  }

  try {
    const usuario = await usuarios.findByPk(id);
    if (!usuario) {
      return response.error(res, {}, 'Usuario no encontrado', 404);
    }

    await usuario.destroy();
    response.success(res, {}, 'Usuario eliminado correctamente');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al eliminar el usuario');
  }
};

exports.obtenerDetalleUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await usuarios.findByPk(id, {
      include: [{ 
        model: roles, 
        as: 'rol',
        include: [{
          model: permisos,
          as: 'permisos_asociados',
          through: { attributes: [] }
        }]
      }]
    });

    if (!usuario) {
      return response.error(res, {}, 'Usuario no encontrado', 404);
    }

    response.success(res, usuario);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener el detalle del usuario');
  }
};

// Cambiar el estado (activo/inactivo) del usuario
exports.cambiarEstadoUsuario = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; // Se espera true o false

  try {
    const usuario = await usuarios.findByPk(id);
    if (!usuario) {
      return response.error(res, {}, 'Usuario no encontrado', 404);
    }

    await usuario.update({ estado });

    response.success(res, { estadoActual: usuario.estado }, 'Estado del usuario actualizado correctamente');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al cambiar el estado del usuario');
  }
};

// Contador total de usuarios registrados
exports.contarUsuarios = async (req, res) => {
  try {
    const totalUsuarios = await usuarios.count();
    response.success(res, { totalUsuarios });
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al contar los usuarios');
  }
};

// Solicitar recuperación de contraseña
exports.solicitarRecuperacion = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return response.error(res, {}, 'El correo es obligatorio', 400);
    }
    const usuario = await usuarios.findOne({ where: { email } });
    if (!usuario) {
      return response.error(res, {}, 'No existe un usuario con ese correo', 404);
    }

    // Generar token de 4 dígitos
    const token = Math.floor(1000 + Math.random() * 9000).toString();
    const expiracion = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await usuario.update({
      reset_token: token,
      reset_token_expiracion: expiracion
    });

    // Enviar correo
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
      subject: 'Recuperación de contraseña',
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Tu código de recuperación es: <b>${token}</b></p>
        <p>Este código es válido por 15 minutos.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    response.success(res, {}, 'Se ha enviado el código de recuperación al correo');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al solicitar recuperación');
  }
};

// Restablecer contraseña
exports.restablecerContrasena = async (req, res) => {
  const { email, token, nuevaContrasena } = req.body;
  try {
    if (!email || !token || !nuevaContrasena) {
      return response.error(res, {}, 'Email, token y nueva contraseña son obligatorios', 400);
    }
    const usuario = await usuarios.findOne({ where: { email } });
    if (!usuario || !usuario.reset_token || !usuario.reset_token_expiracion) {
      return response.error(res, {}, 'Solicitud de recuperación no encontrada', 400);
    }

    if (usuario.reset_token !== token) {
      return response.error(res, {}, 'Token incorrecto o inválido', 400);
    }

    if (new Date() > usuario.reset_token_expiracion) {
      return response.error(res, {}, 'El token ha expirado', 400);
    }

    // Hashear nueva contraseña
    const saltRounds = 10;
    const hash = await bcrypt.hash(nuevaContrasena, saltRounds);

    await usuario.update({
      contraseña: hash,
      reset_token: null,
      reset_token_expiracion: null
    });

    response.success(res, {}, 'Contraseña restablecida correctamente');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al restablecer la contraseña');
  }
};

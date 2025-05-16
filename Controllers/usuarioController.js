// controllers/usuariosController.js
const { usuarios, roles } = require('../models'); // Asegúrate de importar el modelo correcto
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Obtener todos los usuarios
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuariosList = await usuarios.findAll({
      include: [{ model: roles, as: 'rol' }] // Incluir el rol asociado
    });
    res.status(200).json(usuariosList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

// Crear un nuevo usuario
exports.crearUsuario = async (req, res) => {
  const { nombre, apellido, documento, email, contraseña, rol_id } = req.body;

  try {
    // Hashear la contraseña antes de crear el usuario
    const saltRounds = 10;
    const hash = await bcrypt.hash(contraseña, saltRounds);

    const nuevoUsuario = await usuarios.create({
      nombre,
      apellido,
      documento,
      email,
      contraseña: hash,  // Guardamos el hash en lugar de la contraseña en texto plano
      rol_id
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};
const JWT_SECRET = process.env.JWT_SECRET; // Usamos la variable de entorno

exports.login = async (req, res) => {
  const { email, contraseña } = req.body;

  try {
    const usuario = await usuarios.findOne({
      where: { email },
      include: [{ model: roles, as: 'rol' }]
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!usuario.rol) {
      return res.status(403).json({ error: 'Usuario sin rol asignado, no puede iniciar sesión' });
    }

    const passwordValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const payload = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol.nombre
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el inicio de sesión' });
  }
};
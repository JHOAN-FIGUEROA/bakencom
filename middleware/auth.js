const jwt = require('jsonwebtoken');
const { usuarios, roles, permisos } = require('../models');
const response = require('../utils/responseHandler');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para verificar token JWT y cargar datos del usuario
const verificarToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-auth-token');
    
    if (!token) {
      return response.error(res, {}, 'Token de acceso requerido', 401);
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar el usuario completo con rol y permisos
    const usuario = await usuarios.findByPk(decoded.id, {
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

    // Agregar usuario a la request
    req.usuario = usuario;
    next();
  } catch (error) {
    console.error('Error en verificación de token:', error);
    return response.error(res, {}, 'Token inválido', 401);
  }
};

// Middleware para verificar permisos específicos
const verificarPermiso = (permisoRequerido) => {
  return (req, res, next) => {
    const { usuario } = req;
    
    if (!usuario || !usuario.rol) {
      return response.error(res, {}, 'Usuario sin rol asignado', 403);
    }

    // Verificar si el usuario tiene el permiso requerido
    const tienePermiso = usuario.rol.permisos_asociados?.some(
      permiso => permiso.nombre === permisoRequerido
    );

    if (!tienePermiso) {
      return response.error(res, {}, `Permiso '${permisoRequerido}' requerido`, 403);
    }

    next();
  };
};

// Middleware para verificar roles específicos
const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    const { usuario } = req;
    
    if (!usuario || !usuario.rol) {
      return response.error(res, {}, 'Usuario sin rol asignado', 403);
    }

    const rolesArray = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];
    
    if (!rolesArray.includes(usuario.rol.nombre)) {
      return response.error(res, {}, `Rol no autorizado. Roles permitidos: ${rolesArray.join(', ')}`, 403);
    }

    next();
  };
};

module.exports = {
  verificarToken,
  verificarPermiso,
  verificarRol
};
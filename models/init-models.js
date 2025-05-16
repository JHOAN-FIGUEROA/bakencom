var DataTypes = require("sequelize").DataTypes;
var _asistencias = require("./asistencias");
var _clases = require("./clases");
var _estudiante_grupo = require("./estudiante_grupo");
var _estudiantes = require("./estudiantes");
var _grupos = require("./grupos");
var _permisos = require("./permisos");
var _profesores = require("./profesores");
var _roles = require("./roles");
var _roles_permisos = require("./roles_permisos");
var _usuarios = require("./usuarios");

function initModels(sequelize) {
  var asistencias = _asistencias(sequelize, DataTypes);
  var clases = _clases(sequelize, DataTypes);
  var estudiante_grupo = _estudiante_grupo(sequelize, DataTypes);
  var estudiantes = _estudiantes(sequelize, DataTypes);
  var grupos = _grupos(sequelize, DataTypes);
  var permisos = _permisos(sequelize, DataTypes);
  var profesores = _profesores(sequelize, DataTypes);
  var roles = _roles(sequelize, DataTypes);
  var roles_permisos = _roles_permisos(sequelize, DataTypes);
  var usuarios = _usuarios(sequelize, DataTypes);

  // Relaciones existentes
  asistencias.belongsTo(clases, { as: "clase", foreignKey: "clase_id" });
  clases.hasMany(asistencias, { as: "asistencia", foreignKey: "clase_id" });

  estudiante_grupo.belongsTo(estudiantes, { as: "estudiante", foreignKey: "estudiante_id" });
  estudiantes.hasMany(estudiante_grupo, { as: "estudiante_grupos", foreignKey: "estudiante_id" });

  clases.belongsTo(grupos, { as: "grupo", foreignKey: "grupo_id" });
  grupos.hasMany(clases, { as: "clases", foreignKey: "grupo_id" });

  estudiante_grupo.belongsTo(grupos, { as: "grupo", foreignKey: "grupo_id" });
  grupos.hasMany(estudiante_grupo, { as: "estudiante_grupos", foreignKey: "grupo_id" });

  clases.belongsTo(profesores, { as: "profesor", foreignKey: "profesor_id" });
  profesores.hasMany(clases, { as: "clases", foreignKey: "profesor_id" });

  roles_permisos.belongsTo(permisos, { as: "permiso", foreignKey: "permiso_id" });
  permisos.hasMany(roles_permisos, { as: "permisos_roles", foreignKey: "permiso_id" });

  roles_permisos.belongsTo(roles, { as: "rol", foreignKey: "rol_id" });
  roles.hasMany(roles_permisos, { as: "roles_permisos_detalles", foreignKey: "rol_id" });

  usuarios.belongsTo(roles, { as: "rol", foreignKey: "rol_id" });
  roles.hasMany(usuarios, { as: "usuarios", foreignKey: "rol_id" });

  profesores.belongsTo(usuarios, { as: "usuario", foreignKey: "usuario_id" });
  usuarios.hasMany(profesores, { as: "profesores", foreignKey: "usuario_id" });

  // NUEVAS RELACIONES muchos a muchos con alias explícitos
  roles.belongsToMany(permisos, {
    through: roles_permisos,
    foreignKey: 'rol_id',
    otherKey: 'permiso_id',
    as: 'permisos_asociados'
  });

  permisos.belongsToMany(roles, {
    through: roles_permisos,
    foreignKey: 'permiso_id',
    otherKey: 'rol_id',
    as: 'roles_asociados'
  });

  return {
    asistencias,
    clases,
    estudiante_grupo,
    estudiantes,
    grupos,
    permisos,
    profesores,
    roles,
    roles_permisos,
    usuarios,
  };
}

module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;

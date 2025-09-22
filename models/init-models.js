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
var _programas = require("./programas");
var _estudiante_programa = require("./estudiante_programa");
var _salones = require("./salones");

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
  var programas = _programas(sequelize, DataTypes);
  var estudiante_programa = _estudiante_programa(sequelize, DataTypes);
  var salones = _salones(sequelize, DataTypes);

  // Relaciones existentes
  asistencias.belongsTo(clases, { as: "clase", foreignKey: "clase_id" });
  clases.hasMany(asistencias, { as: "asistencia", foreignKey: "clase_id" });
  
  asistencias.belongsTo(estudiantes, { as: "estudiante", foreignKey: "estudiante_id", targetKey: "documento" });
  estudiantes.hasMany(asistencias, { as: "asistencias", foreignKey: "estudiante_id", sourceKey: "documento" });

  estudiante_grupo.belongsTo(estudiantes, { as: "estudiante", foreignKey: "estudiante_id" });
  estudiantes.hasMany(estudiante_grupo, { as: "estudiante_grupos", foreignKey: "estudiante_id" });

  clases.belongsTo(grupos, { as: "grupo", foreignKey: "grupo_id" });
  grupos.hasMany(clases, { as: "clases", foreignKey: "grupo_id" });

  estudiante_grupo.belongsTo(grupos, { as: "grupo", foreignKey: "grupo_id" });
  grupos.hasMany(estudiante_grupo, { as: "estudiante_grupos", foreignKey: "grupo_id" });

  clases.belongsTo(profesores, { as: "profesor", foreignKey: "profesor_id" });
  profesores.hasMany(clases, { as: "clases", foreignKey: "profesor_id" });

  clases.belongsTo(salones, { as: "salon", foreignKey: "salon_id" });
  salones.hasMany(clases, { as: "clases", foreignKey: "salon_id" });

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

  // RELACIÓN MUCHOS A MUCHOS ESTUDIANTES <-> GRUPOS
  estudiantes.belongsToMany(grupos, {
    through: estudiante_grupo,
    foreignKey: 'estudiante_id',
    otherKey: 'grupo_id',
    as: 'grupos'
  });

  grupos.belongsToMany(estudiantes, {
    through: estudiante_grupo,
    foreignKey: 'grupo_id',
    otherKey: 'estudiante_id',
    as: 'estudiantes'
  });

  // RELACIÓN MUCHOS A MUCHOS ESTUDIANTES <-> PROGRAMAS
  estudiantes.belongsToMany(programas, {
    through: estudiante_programa,
    foreignKey: 'estudiante_id',
    otherKey: 'programa_id',
    as: 'programas'
  });

  programas.belongsToMany(estudiantes, {
    through: estudiante_programa,
    foreignKey: 'programa_id',
    otherKey: 'estudiante_id',
    as: 'estudiantes'
  });

  // RELACIÓN UNO A MUCHOS GRUPOS <-> PROGRAMAS
  grupos.belongsTo(programas, { as: 'programa', foreignKey: 'programa_id' });
  programas.hasMany(grupos, { as: 'grupos', foreignKey: 'programa_id' });

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
    programas,
    estudiante_programa,
    salones,
  };
}

module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;

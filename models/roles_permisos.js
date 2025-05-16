// models/roles_permisos.js
const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const RolesPermisos = sequelize.define('roles_permisos', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    rol_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'roles',
        key: 'id'
      },
      unique: "roles_permisos_rol_id_permiso_id_key"
    },
    permiso_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'permisos',
        key: 'id'
      },
      unique: "roles_permisos_rol_id_permiso_id_key"
    }
  }, {
    sequelize,
    tableName: 'roles_permisos',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "roles_permisos_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "roles_permisos_rol_id_permiso_id_key",
        unique: true,
        fields: [
          { name: "rol_id" },
          { name: "permiso_id" },
        ]
      },
    ]
  });

  return RolesPermisos;
};

// models/rol.js
const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const Rol = sequelize.define('roles', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "roles_nombre_key"
    },estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,  // El valor por defecto será TRUE (activo)
    }
  }, {
    sequelize,
    tableName: 'roles',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "roles_nombre_key",
        unique: true,
        fields: [
          { name: "nombre" },
        ]
      },
      {
        name: "roles_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });

  // Asociación muchos a muchos con permisos
  Rol.associate = function(models) {
    Rol.belongsToMany(models.permisos, {
      through: models.roles_permisos,
      as: 'permisos_asociados',
      foreignKey: 'rol_id',
      otherKey: 'permiso_id'
    });
  };

  return Rol;
};

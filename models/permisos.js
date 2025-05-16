// models/permisos.js
const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const Permiso = sequelize.define('permisos', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "permisos_nombre_key"
    }
  }, {
    sequelize,
    tableName: 'permisos',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "permisos_nombre_key",
        unique: true,
        fields: [
          { name: "nombre" },
        ]
      },
      {
        name: "permisos_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });

  // Asociación muchos a muchos con roles
  Permiso.associate = function(models) {
    Permiso.belongsToMany(models.roles, {
      through: models.roles_permisos,
      as: 'roles_asociados',
      foreignKey: 'permiso_id',
      otherKey: 'rol_id'
    });
  };

  return Permiso;
};

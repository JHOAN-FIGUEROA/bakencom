// models/usuarios.js
const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const Usuario = sequelize.define('usuarios', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    apellido: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    documento: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "usuarios_documento_key"
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "usuarios_email_key"
    },
    contraseña: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,  // El valor por defecto será TRUE (activo)
    },
    rol_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'roles',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'usuarios',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "usuarios_documento_key",
        unique: true,
        fields: [
          { name: "documento" },
        ]
      },
      {
        name: "usuarios_email_key",
        unique: true,
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "usuarios_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });

  // Asociación uno a muchos con rol
  Usuario.associate = function(models) {
    Usuario.belongsTo(models.roles, { foreignKey: 'rol_id', as: 'rol' });
  };

  return Usuario;
};

const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('profesores', {
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
      unique: "profesores_documento_key"
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'profesores',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "profesores_documento_key",
        unique: true,
        fields: [
          { name: "documento" },
        ]
      },
      {
        name: "profesores_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};

const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('programas', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    duracion: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    modalidad: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'programas',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: 'programas_pkey',
        unique: true,
        fields: [
          { name: 'id' },
        ]
      },
      {
        name: 'programas_nombre_key',
        unique: true,
        fields: [
          { name: 'nombre' },
        ]
      }
    ]
  });
}; 
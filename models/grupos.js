const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('grupos', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    // Nuevos campos opcionales para soportar el formulario del frontend
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    semestre: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    programa_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'programas',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'grupos',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "grupos_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      }
    ]
  });
};

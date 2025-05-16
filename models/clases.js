const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('clases', {
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
    semestre: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    grupo_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'grupos',
        key: 'id'
      }
    },
    profesor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'profesores',
        key: 'id'
      }
    },
    dia_semana: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    hora_inicio: {
      type: DataTypes.TIME,
      allowNull: true
    },
    hora_fin: {
      type: DataTypes.TIME,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'clases',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "clases_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};

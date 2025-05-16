const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('asistencias', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    clase_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'clases',
        key: 'id'
      },
      unique: "asistencias_clase_id_estudiante_id_fecha_key"
    },
    estudiante_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: "asistencias_clase_id_estudiante_id_fecha_key"
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: "asistencias_clase_id_estudiante_id_fecha_key"
    },
    presente: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    sequelize,
    tableName: 'asistencias',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "asistencias_clase_id_estudiante_id_fecha_key",
        unique: true,
        fields: [
          { name: "clase_id" },
          { name: "estudiante_id" },
          { name: "fecha" },
        ]
      },
      {
        name: "asistencias_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};

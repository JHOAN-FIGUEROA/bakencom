const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('estudiantes', {
    numerofolio: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    tipo_documento: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    documento: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    departamento: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    Municipio: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    programa: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    horario_programa: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    eps: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    foto: {
      type: DataTypes.BLOB,
      allowNull: true
    },
    rh: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'estudiantes',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "estudiantes_pkey",
        unique: true,
        fields: [
          { name: "documento" },
        ]
      },
    ]
  });
};

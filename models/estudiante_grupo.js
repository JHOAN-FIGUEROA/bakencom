const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('estudiante_grupo', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    estudiante_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: 'estudiantes',
        key: 'documento'
      },
      unique: "estudiante_grupo_unico"
    },
    grupo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'grupos',
        key: 'id'
      },
      unique: "estudiante_grupo_unico"
    }
  }, {
    sequelize,
    tableName: 'estudiante_grupo',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "estudiante_grupo_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "estudiante_grupo_unico",
        unique: true,
        fields: [
          { name: "estudiante_id" },
          { name: "grupo_id" },
        ]
      },
    ]
  });
};

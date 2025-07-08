const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('estudiante_programa', {
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
      }
    },
    programa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'programas',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'estudiante_programa',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: 'estudiante_programa_pkey',
        unique: true,
        fields: [
          { name: 'id' },
        ]
      }
    ]
  });
}; 
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,  // Asegúrate de que esté definido en tu archivo .env
  dialect: 'postgres',
  port: process.env.DB_PORT, // Puerto de la base de datos
  dialectOptions: {
    ssl: false  // Desactivar SSL para entornos locales
  },
  logging: false, // opcional: desactiva logs de SQL en consola
});

module.exports = sequelize;


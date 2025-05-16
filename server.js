const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

const sequelize = require('./config/database');
require('dotenv').config();

app.use(express.json());


const rolesRoutes = require('./Routes/rolRoutes');  
const usuariosRoutes = require('./Routes/usuarioRoutes');
const permisosRoutes = require ('./Routes/permisoRoutes');  
app.use('/api/rol', rolesRoutes);// Ajusta la ruta
app.use('/api/usuarios', usuariosRoutes);// Ajusta la ruta
app.use('/api/permisos', permisosRoutes);// Ajusta la ruta

sequelize.authenticate()
  .then(() => {
    console.log('✅ Conectado a la base de datos PostgreSQL');
  })
  .catch(err => {
    console.error('❌ Error al conectar a la base de datos:', err);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

const sequelize = require('./config/database');
require('dotenv').config();

app.use(express.json());


const rolesRoutes = require('./Routes/rolRoutes');  
const usuariosRoutes = require('./Routes/usuarioRoutes');
const permisosRoutes = require('./Routes/permisoRoutes');
const asistenciasRoutes = require('./Routes/asistenciasRoutes');
const clasesRoutes = require('./Routes/clasesRoutes');
const estudiantesRoutes = require('./Routes/estudiantesRoutes');
const gruposRoutes = require('./Routes/gruposRoutes');
const profesoresRoutes = require('./Routes/profesoresRoutes');
const estudianteGrupoRoutes = require('./Routes/estudianteGrupoRoutes');
const programaRoutes = require('./Routes/programaRoutes');

app.use('/api/rol', rolesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/permisos', permisosRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/clases', clasesRoutes);
app.use('/api/estudiantes', estudiantesRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/profesores', profesoresRoutes);
app.use('/api/estudiante-grupo', estudianteGrupoRoutes);
app.use('/api/programas', programaRoutes);

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

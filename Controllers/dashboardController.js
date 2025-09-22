const sequelize = require('../config/database');
const { usuarios, estudiantes, profesores, grupos, asistencias } = require('../models');
const response = require('../utils/responseHandler');

// Utilidad para formatear fecha YYYY-MM-DD en local
function formatDateYMD(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

exports.resumen = async (req, res) => {
  try {
    const hoy = formatDateYMD(new Date());

    const [totalUsuarios, totalEstudiantesActivos, totalProfesores, totalGrupos, presentesHoy, ausentesHoy] = await Promise.all([
      usuarios.count(),
      estudiantes.count({ where: { estado: true } }),
      profesores.count(), // No existe campo estado en profesores.js, contamos todos
      grupos.count(),
      asistencias.count({ where: { fecha: hoy, presente: true } }),
      asistencias.count({ where: { fecha: hoy, presente: false } })
    ]);

    response.success(res, {
      usuariosTotales: totalUsuarios,
      estudiantesActivos: totalEstudiantesActivos,
      profesoresTotales: totalProfesores,
      gruposTotales: totalGrupos,
      asistenciasHoy: {
        presentes: presentesHoy,
        ausentes: ausentesHoy,
        total: presentesHoy + ausentesHoy
      }
    });
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al generar el resumen del dashboard');
  }
};

exports.asistenciasDiarias = async (req, res) => {
  try {
    const dias = Math.max(1, parseInt(req.query.dias, 10) || 30);
    const hoy = new Date();
    const inicioDate = new Date(hoy);
    inicioDate.setDate(hoy.getDate() - (dias - 1));

    const inicio = formatDateYMD(inicioDate);
    const fin = formatDateYMD(hoy);

    // Agregación en SQL (PostgreSQL)
    const [rows] = await sequelize.query(
      `SELECT fecha::date AS fecha,
              SUM(CASE WHEN presente THEN 1 ELSE 0 END) AS presentes,
              SUM(CASE WHEN NOT presente THEN 1 ELSE 0 END) AS ausentes
       FROM asistencias
       WHERE fecha BETWEEN :inicio AND :fin
       GROUP BY fecha
       ORDER BY fecha ASC`,
      { replacements: { inicio, fin } }
    );

    // Mapear resultados por fecha para completar días faltantes
    const map = new Map(rows.map(r => [formatDateYMD(new Date(r.fecha)), { presentes: Number(r.presentes) || 0, ausentes: Number(r.ausentes) || 0 }]));

    const serie = [];
    const cursor = new Date(inicioDate);
    while (cursor <= hoy) {
      const key = formatDateYMD(cursor);
      const data = map.get(key) || { presentes: 0, ausentes: 0 };
      serie.push({ fecha: key, presentes: data.presentes, ausentes: data.ausentes });
      cursor.setDate(cursor.getDate() - 0 + 1);
    }

    response.success(res, serie);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener asistencias diarias');
  }
};

exports.estudiantesPorPrograma = async (req, res) => {
  try {
    const top = Math.max(1, parseInt(req.query.top, 10) || 5);

    const [rows] = await sequelize.query(
      `SELECT p.nombre AS programa, COUNT(ep.estudiante_id) AS total
       FROM estudiante_programa ep
       JOIN programas p ON p.id = ep.programa_id
       GROUP BY p.nombre
       ORDER BY total DESC
       LIMIT :limite`,
      { replacements: { limite: top } }
    );

    // Normalizar números
    const data = rows.map(r => ({ programa: r.programa, total: Number(r.total) || 0 }));

    response.success(res, data);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener estudiantes por programa');
  }
};
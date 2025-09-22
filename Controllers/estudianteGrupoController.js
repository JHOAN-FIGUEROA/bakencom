const { estudiante_grupo, estudiantes, grupos } = require('../models');
const response = require('../utils/responseHandler');
const nodemailer = require('nodemailer');

// Asignar estudiante a un grupo
exports.asignarEstudianteAGrupo = async (req, res) => {
  const { estudiante_id, grupo_id } = req.body;

  try {
    // Verificar que el estudiante existe
    const estudiante = await estudiantes.findByPk(estudiante_id);
    if (!estudiante) {
      return response.error(res, {}, 'Estudiante no encontrado', 404);
    }

    // Verificar que el grupo existe
    const grupo = await grupos.findByPk(grupo_id);
    if (!grupo) {
      return response.error(res, {}, 'Grupo no encontrado', 404);
    }

    // Obtener el programa asociado al grupo
    let programa = null;
    if (grupo.programa_id) {
      const { programas } = require('../models');
      programa = await programas.findByPk(grupo.programa_id);
    }

    // Crear la relación con la fecha de asignación
    const nuevaAsignacion = await estudiante_grupo.create({
      estudiante_id,
      grupo_id,
      fecha_asignacion: new Date()
    });

    // Enviar correo al estudiante
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        }
      });

      let fechaMatricula = nuevaAsignacion.fecha_asignacion instanceof Date
        ? nuevaAsignacion.fecha_asignacion.toLocaleDateString()
        : new Date(nuevaAsignacion.fecha_asignacion).toLocaleDateString();
      let htmlCorreo = `
        <div style="background:#0a2342;padding:0;margin:0;font-family:sans-serif;">
          <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
            <div style="background:#0a2342;padding:24px 0;text-align:center;">
              <img src="https://i.imgur.com/2yaf2wb.png" alt="Classlog" style="height:60px;margin-bottom:10px;">
              <h2 style="color:#fff;margin:0;">¡Matrícula exitosa!</h2>
            </div>
            <div style="padding:32px 24px 24px 24px;">
              <h3 style="color:#0a2342;margin-top:0;">¡Hola ${estudiante.nombre} ${estudiante.apellido}!</h3>
              <p style="color:#222;">Te informamos que <b>has sido matriculado exitosamente</b> en un grupo académico de nuestra plataforma.</p>
              <ul style="color:#0a2342;font-size:1.05em;padding-left:18px;">
                <li><b>Nombre del estudiante:</b> ${estudiante.nombre} ${estudiante.apellido}</li>
                <li><b>Documento:</b> ${estudiante.documento}</li>
                <li><b>Grupo:</b> ${grupo.nombre}</li>
                ${programa ? `<li><b>Programa:</b> ${programa.nombre}</li>` : ''}
                ${programa ? `<li><b>Duración del programa:</b> ${programa.duracion}</li>` : ''}
                ${programa ? `<li><b>Modalidad:</b> ${programa.modalidad}</li>` : ''}
                <li><b>Fecha de matrícula:</b> ${fechaMatricula}</li>
              </ul>
              <div style="margin:24px 0 0 0;">
                <p style="color:#0a2342;">Si tienes dudas, comunícate con la coordinación académica.</p>
                <p style="color:#0a2342;font-weight:bold;">¡Bienvenido a Classlog y mucho éxito!</p>
              </div>
            </div>
            <div style="background:#000;color:#fff;text-align:center;padding:12px 0;font-size:0.95em;">
              Classlog &copy; ${new Date().getFullYear()}
            </div>
          </div>
        </div>
      `;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: estudiante.email, // Asegúrate de tener el campo email en estudiantes
        subject: 'Asignación a grupo académico',
        html: htmlCorreo
      };

      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.error('Error al enviar correo al estudiante:', mailError);
    }

    response.success(res, nuevaAsignacion, 'Estudiante asignado al grupo correctamente y correo enviado', 201);
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return response.error(res, error, 'El estudiante ya está asignado a este grupo', 400);
    }
    response.error(res, error, 'Error al asignar estudiante al grupo');
  }
};

// Remover estudiante de un grupo
exports.removerEstudianteDeGrupo = async (req, res) => {
  const { estudiante_id, grupo_id } = req.params;

  try {
    const asignacion = await estudiante_grupo.findOne({
      where: { estudiante_id, grupo_id }
    });

    if (!asignacion) {
      return response.error(res, {}, 'Asignación no encontrada', 404);
    }

    await asignacion.destroy();
    response.success(res, {}, 'Estudiante removido del grupo correctamente');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al remover estudiante del grupo');
  }
};

// Obtener todas las asignaciones
exports.obtenerAsignaciones = async (req, res) => {
  try {
    if (req.query.all === 'true') {
      const lista = await estudiante_grupo.findAll({
        include: [
          { model: estudiantes, as: 'estudiante' },
          { model: grupos, as: 'grupo' }
        ],
        order: [['id', 'ASC']]
      });
      return response.success(res, lista);
    }
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = 5;
    const offset = (pagina - 1) * limite;
    const { count, rows } = await estudiante_grupo.findAndCountAll({
      include: [
        { model: estudiantes, as: 'estudiante' },
        { model: grupos, as: 'grupo' }
      ],
      limit: limite,
      offset: offset,
      order: [['id', 'ASC']]
    });
    const totalPaginas = Math.ceil(count / limite);
    response.success(res, {
      asignaciones: rows,
      totalAsignaciones: count,
      totalPaginas,
      paginaActual: pagina
    });
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener las asignaciones');
  }
};

// Obtener grupos de un estudiante
exports.obtenerGruposDeEstudiante = async (req, res) => {
  const { estudiante_id } = req.params;

  try {
    const gruposEstudiante = await estudiante_grupo.findAll({
      where: { estudiante_id },
      include: [
        { model: grupos, as: 'grupo' }
      ]
    });

    response.success(res, gruposEstudiante);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener grupos del estudiante');
  }
};

// Obtener estudiantes de un grupo
exports.obtenerEstudiantesDeGrupo = async (req, res) => {
  const { grupo_id } = req.params;

  try {
    const estudiantesGrupo = await estudiante_grupo.findAll({
      where: { grupo_id },
      include: [
        { model: estudiantes, as: 'estudiante' }
      ]
    });

    response.success(res, estudiantesGrupo);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener estudiantes del grupo');
  }
}; 
const { clases, grupos, profesores, asistencias, salones, estudiantes } = require('../models');
const { Op } = require('sequelize');
const response = require('../utils/responseHandler');
const nodemailer = require('nodemailer');

// Función auxiliar para convertir día de semana a texto
const getDiaSemanaTexto = (dia) => {
  const dias = {
    '1': 'Lunes',
    '2': 'Martes', 
    '3': 'Miércoles',
    '4': 'Jueves',
    '5': 'Viernes',
    '6': 'Sábado',
    '7': 'Domingo'
  };
  return dias[dia] || 'Sin día';
};

// Obtener todas las clases
exports.obtenerClases = async (req, res) => {
  try {
    if (req.query.all === 'true') {
      const lista = await clases.findAll({
        include: [
          { model: grupos, as: 'grupo' },
          { model: profesores, as: 'profesor' },
          { model: salones, as: 'salon' }
        ],
        order: [['nombre', 'ASC']]
      });
      return response.success(res, lista);
    }
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = 5;
    const offset = (pagina - 1) * limite;
    const { count, rows } = await clases.findAndCountAll({
      include: [
        { model: grupos, as: 'grupo' },
        { model: profesores, as: 'profesor' },
        { model: salones, as: 'salon' }
      ],
      limit: limite,
      offset: offset,
      order: [['nombre', 'ASC']]
    });
    const totalPaginas = Math.ceil(count / limite);
    response.success(res, {
      clases: rows,
      totalClases: count,
      totalPaginas,
      paginaActual: pagina
    });
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener las clases');
  }
};

// Crear una nueva clase
exports.crearClase = async (req, res) => {
  const { nombre, semestre, grupo_id, profesor_id, dia_semana, hora_inicio, hora_fin, descripcion } = req.body;

  try {
    const nuevaClase = await clases.create({
      nombre,
      semestre,
      grupo_id,
      profesor_id,
      dia_semana,
      hora_inicio,
      hora_fin,
      descripcion
    });

    // Obtener grupo, estudiantes y profesor
    const grupo = await grupos.findByPk(grupo_id, {
      include: [{ association: 'estudiantes' }]
    });
    const profesor = await profesores.findByPk(profesor_id);

    // Enviar correo a cada estudiante del grupo
    if (grupo && grupo.estudiantes && grupo.estudiantes.length > 0 && profesor) {
      for (const estudiante of grupo.estudiantes) {
        if (!estudiante.email) continue;
        let htmlCorreo = `
          <div style="background:#0a2342;padding:0;margin:0;font-family:sans-serif;">
            <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
              <div style="background:#0a2342;padding:24px 0;text-align:center;">
                <img src="https://i.imgur.com/2yaf2wb.png" alt="Classlog" style="height:60px;margin-bottom:10px;">
                <h2 style="color:#fff;margin:0;">¡Nueva clase asignada!</h2>
              </div>
              <div style="padding:32px 24px 24px 24px;">
                <h3 style="color:#0a2342;margin-top:0;">¡Hola ${estudiante.nombre} ${estudiante.apellido}!</h3>
                <p style="color:#222;">Te informamos que has sido asignado a una nueva clase en la plataforma.</p>
                <ul style="color:#0a2342;font-size:1.05em;padding-left:18px;">
                  <li><b>Nombre de la clase:</b> ${nombre}</li>
                  <li><b>Grupo:</b> ${grupo.nombre}</li>
                  <li><b>Profesor:</b> ${profesor.nombre} ${profesor.apellido}</li>
                  <li><b>Email del profesor:</b> ${profesor.email}</li>
                  <li><b>Día de la semana:</b> ${dia_semana}</li>
                  <li><b>Hora inicio:</b> ${hora_inicio}</li>
                  <li><b>Hora fin:</b> ${hora_fin}</li>
                  ${descripcion ? `<li><b>Descripción:</b> ${descripcion}</li>` : ''}
                </ul>
                <div style="margin:24px 0 0 0;">
                  <p style="color:#0a2342;">Si tienes dudas, comunícate con la coordinación académica o con tu profesor.</p>
                  <p style="color:#0a2342;font-weight:bold;">¡Bienvenido a tu nueva clase y mucho éxito!</p>
                </div>
              </div>
              <div style="background:#000;color:#fff;text-align:center;padding:12px 0;font-size:0.95em;">
                Classlog &copy; ${new Date().getFullYear()}
              </div>
            </div>
          </div>
        `;
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD,
            }
          });
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: estudiante.email,
            subject: 'Nueva clase asignada',
            html: htmlCorreo
          });
        } catch (mailError) {
          console.error('Error al enviar correo al estudiante:', estudiante.email, mailError);
        }
      }
    }

    const claseConRelaciones = await clases.findByPk(nuevaClase.id, {
      include: [
        { model: grupos, as: 'grupo' },
        { model: profesores, as: 'profesor' }
      ]
    });

    response.success(res, claseConRelaciones, 'Clase creada', 201);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al crear la clase');
  }
};

// Obtener clase por ID
exports.obtenerClasePorId = async (req, res) => {
  const { id } = req.params;

  try {
    const clase = await clases.findByPk(id, {
      include: [
        { model: grupos, as: 'grupo' },
        { model: profesores, as: 'profesor' }
      ]
    });

    if (!clase) {
      return response.error(res, {}, 'Clase no encontrada', 404);
    }

    response.success(res, clase);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener la clase');
  }
};

// Actualizar clase
exports.actualizarClase = async (req, res) => {
  const { id } = req.params;
  const { nombre, semestre, grupo_id, profesor_id, dia_semana, hora_inicio, hora_fin, salon_id } = req.body;

  try {
    const clase = await clases.findByPk(id);
    if (!clase) {
      return response.error(res, {}, 'Clase no encontrada', 404);
    }

    await clase.update({ nombre, semestre, grupo_id, profesor_id, dia_semana, hora_inicio, hora_fin, salon_id });

    response.success(res, clase, 'Clase actualizada correctamente');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al actualizar la clase');
  }
};

// Eliminar clase
exports.eliminarClase = async (req, res) => {
  const { id } = req.params;

  try {
    const clase = await clases.findByPk(id);
    if (!clase) {
      return response.error(res, {}, 'Clase no encontrada', 404);
    }

    await clase.destroy();
    response.success(res, {}, 'Clase eliminada correctamente');
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al eliminar la clase');
  }
};

// Obtener clases por grupo
exports.obtenerClasesPorGrupo = async (req, res) => {
  const { grupo_id } = req.params;

  try {
    const clasesGrupo = await clases.findAll({
      where: { grupo_id },
      include: [
        { model: grupos, as: 'grupo' },
        { model: profesores, as: 'profesor' }
      ],
      order: [['nombre', 'ASC']]
    });

    response.success(res, clasesGrupo);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener las clases del grupo');
  }
};

// Obtener clases por profesor
exports.obtenerClasesPorProfesor = async (req, res) => {
  const { profesor_id } = req.params;

  try {
    const clasesProfesor = await clases.findAll({
      where: { profesor_id },
      include: [
        { model: grupos, as: 'grupo' },
        { model: profesores, as: 'profesor' }
      ],
      order: [['nombre', 'ASC']]
    });

    response.success(res, clasesProfesor);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener las clases del profesor');
  }
};

// Obtener clases por día de la semana
exports.obtenerClasesPorDia = async (req, res) => {
  const { dia_semana } = req.params;

  try {
    const clasesDia = await clases.findAll({
      where: { dia_semana },
      include: [
        { model: grupos, as: 'grupo' },
        { model: profesores, as: 'profesor' }
      ],
      order: [['hora_inicio', 'ASC']]
    });

    response.success(res, clasesDia);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener las clases del día');
  }
};

// Obtener clases disponibles para tomar asistencia
// Para profesores: solo sus clases del día actual en horario válido
// Para administradores: todas las clases
exports.obtenerClasesParaAsistencia = async (req, res) => {
  try {
    const usuario = req.usuario; // Viene del middleware de autenticación
    const ahora = new Date();
    const diaActual = ahora.getDay(); // 0=Domingo, 1=Lunes, etc.
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes(); // Minutos desde medianoche
    
    // Mapear día de la semana a nombre
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const nombreDiaActual = diasSemana[diaActual];
    
    let whereCondition = {};
    
    // Si es profesor, filtrar por sus clases y horario
    if (usuario.rol?.nombre === 'Profesor') {
      // Buscar el profesor asociado al usuario
      const profesor = await profesores.findOne({
        where: { usuario_id: usuario.id }
      });
      
      if (!profesor) {
        return response.error(res, {}, 'Usuario profesor no encontrado. Contacte al administrador para crear su perfil de profesor.', 404);
      }
      
      whereCondition = {
        profesor_id: profesor.id,
        dia_semana: nombreDiaActual
      };
    } else if (usuario.rol?.nombre === 'Administrador') {
      // Administrador puede ver todas las clases
      whereCondition = {};
    } else {
      return response.error(res, {}, 'No tiene permisos para tomar asistencia', 403);
    }
    
    const clasesDisponibles = await clases.findAll({
      where: whereCondition,
      include: [
        { model: grupos, as: 'grupo' },
        { model: profesores, as: 'profesor' },
        { model: salones, as: 'salon' }
      ],
      order: [['hora_inicio', 'ASC']]
    });
    
    // Para profesores, NO filtrar por ventana de tiempo, solo mostrar todas sus clases del día
    // La validación de tiempo se hace en el campo 'puede_tomar_asistencia'
    let clasesFiltradas = clasesDisponibles;
    
    // Agregar información de disponibilidad
    const clasesConDisponibilidad = clasesFiltradas.map(clase => {
      const [horaInicio, minutoInicio] = clase.hora_inicio.split(':').map(Number);
      const [horaFin, minutoFin] = clase.hora_fin.split(':').map(Number);
      
      const inicioEnMinutos = horaInicio * 60 + minutoInicio;
      const finEnMinutos = horaFin * 60 + minutoFin;
      const ventanaInicio = inicioEnMinutos;
      const ventanaFin = finEnMinutos;
      
      return {
          ...clase.toJSON(),
          puede_tomar_asistencia: usuario.rol?.nombre === 'Administrador' || 
                                 (horaActual >= ventanaInicio && horaActual <= ventanaFin),
          ventana_inicio: `${Math.floor(ventanaInicio / 60).toString().padStart(2, '0')}:${(ventanaInicio % 60).toString().padStart(2, '0')}`,
          ventana_fin: `${Math.floor(ventanaFin / 60).toString().padStart(2, '0')}:${(ventanaFin % 60).toString().padStart(2, '0')}`
        };
    });
    
    response.success(res, clasesConDisponibilidad);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al obtener las clases para asistencia');
  }
};

// Obtener reporte de asistencias para descarga
exports.obtenerReporteAsistencias = async (req, res) => {
  try {
    const { usuario } = req;
    const { fecha_inicio, fecha_fin, clase_id, grupo_id } = req.query;
    
    let whereConditionClases = {};
    let whereConditionAsistencias = {};
    
    // Filtrar por rol
    if (usuario.rol?.nombre === 'Profesor') {
      const profesor = await profesores.findOne({
        where: { usuario_id: usuario.id }
      });
      
      if (!profesor) {
        return response.error(res, {}, 'Usuario profesor no encontrado', 404);
      }
      
      whereConditionClases.profesor_id = profesor.id;
    }
    
    // Filtros adicionales
    if (clase_id) whereConditionClases.id = clase_id;
    if (grupo_id) whereConditionClases.grupo_id = grupo_id;
    
    // Filtros de fecha
    if (fecha_inicio && fecha_fin) {
      whereConditionAsistencias.fecha = {
        [Op.between]: [fecha_inicio, fecha_fin]
      };
    } else {
      // Por defecto, últimos 30 días
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      whereConditionAsistencias.fecha = {
        [Op.gte]: hace30Dias
      };
    }
    
    // Obtener asistencias con relaciones
    const asistenciasData = await asistencias.findAll({
      where: whereConditionAsistencias,
      include: [
        {
          model: clases,
          as: 'clase',
          where: whereConditionClases,
          include: [
            { model: grupos, as: 'grupo' },
            { model: profesores, as: 'profesor' },
            { model: salones, as: 'salon' }
          ]
        },
        {
          model: estudiantes,
          as: 'estudiante'
        }
      ],
      order: [['fecha', 'DESC'], ['clase_id', 'ASC']]
    });
    
    // Formatear datos para el reporte (solo registros con estudiante válido)
    const reporteData = asistenciasData
      .filter(asistencia => 
        asistencia.estudiante && 
        asistencia.estudiante.nombre && 
        asistencia.estudiante.documento
      )
      .map(asistencia => {
        const fechaFormateada = new Date(asistencia.fecha).toLocaleDateString('es-ES');
        const nombreCompleto = `${asistencia.estudiante.nombre} ${asistencia.estudiante.apellido}`.trim();
        const profesorCompleto = `${asistencia.clase?.profesor?.nombre || ''} ${asistencia.clase?.profesor?.apellido || ''}`.trim();
        const horarioCompleto = `${asistencia.clase?.hora_inicio || ''} - ${asistencia.clase?.hora_fin || ''}`;
        
        return {
          fecha: fechaFormateada,
          clase: asistencia.clase?.nombre || 'Sin clase',
          grupo: asistencia.clase?.grupo?.nombre || 'Sin grupo',
          profesor: profesorCompleto || 'Sin profesor',
          salon: asistencia.clase?.salon?.nombre || 'Sin salón',
          estudiante: nombreCompleto,
          documento: asistencia.estudiante.documento,
          estado: asistencia.presente ? 'Presente' : 'Ausente',
          horario: horarioCompleto,
          dia_semana: getDiaSemanaTexto(asistencia.clase?.dia_semana)
        };
      });
    
    // Eliminar duplicados basados en fecha, clase, estudiante
    const reporteUnico = reporteData.filter((item, index, self) => 
      index === self.findIndex(t => 
        t.fecha === item.fecha && 
        t.clase === item.clase && 
        t.documento === item.documento
      )
    );
    
    response.success(res, reporteUnico);
  } catch (error) {
    console.error(error);
    response.error(res, error, 'Error al generar el reporte de asistencias');
  }
};
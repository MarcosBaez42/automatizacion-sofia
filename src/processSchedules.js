import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx/xlsx.mjs';
import nodemailer from 'nodemailer';
import { iniciarSesion, descargarReporte } from './loginDownload.js';
import { cfg } from './config.js';
import Schedule from './models/Schedule.js';
import Fiche from './models/Fiche.js';
import Instructor from './models/Instructor.js';
import DailyProcessingLog, {
  NOTIFICATION_RESULT_MESSAGE
} from './models/DailyProcessingLog.js';
import {
  findHeaderIndex,
  findHeaderIndexes,
  normalizeText,
  parseExcelDate
} from './utils/reportProcessing.js';

XLSX.set_fs(fs);

const MAX_GROUPS_TO_PROCESS = 3;

/**
 * Construye el pipeline de agregación que obtiene las fichas con horarios
 * pendientes de calificación dentro del rango de fechas permitido.
 *
 * @param {Date} limitDate - Fecha límite utilizada para filtrar horarios.
 * @returns {Array<Object>} Stages de la agregación de MongoDB.
 */
function buildPendingSchedulesPipeline(limitDate) {
  return [
    {
      $match: {
        $and: [
          { fend: { $lt: limitDate } },
          {
            $or: [
              { calificado: { $exists: false } },
              { calificado: false },
              { calificado: null }
            ]
          },
          {
            $or: [
              { calificable: { $exists: false } },
              { calificable: true },
              { calificable: null },
              { calificable: { $nin: [true, false] } }
            ]
          }
        ]
      }
    },
    {
      $group: {
        _id: '$fiche',
        scheduleIds: { $addToSet: '$_id' },
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: Fiche.collection.name,
        localField: '_id',
        foreignField: '_id',
        as: 'fiche'
      }
    },
    { $unwind: '$fiche' },
    {
      $lookup: {
        from: Instructor.collection.name,
        localField: 'fiche.owner',
        foreignField: '_id',
        as: 'instructor'
      }
    },
    {
      $unwind: {
        path: '$instructor',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        ficheId: '$_id',
        scheduleIds: 1,
        scheduleCount: '$count',
        ficheNumber: '$fiche.number',
        instructorId: '$instructor._id',
        instructorName: '$instructor.name',
        instructorEmail: '$instructor.email',
        instructorEmailPersonal: '$instructor.emailpersonal'
      }
    }
  ];
}

/**
 * Ejecuta la agregación para recuperar los grupos de horarios pendientes.
 *
 * @param {Date} limitDate - Fecha límite para filtrar horarios.
 * @returns {Promise<Array<Object>>} Resultados de la agregación.
 */
function fetchPendingScheduleGroups(limitDate) {
  const pipeline = buildPendingSchedulesPipeline(limitDate);
  return Schedule.aggregate(pipeline);
}

/**
 * Analiza el reporte descargado de Sofía Plus para determinar el estado de
 * calificación de los aprendices.
 *
 * @param {string} reportPath - Ruta local del archivo de Excel descargado.
 * @returns {{
 *   graded: boolean,
 *   gradeStatus: string,
 *   gradeDate: Date | null,
 *   gradedRows: Array<Object>,
 *   pendingRows: Array<Object>,
 *   statusIndex: number,
 *   dateIndex: number
 * }} Información obtenida tras inspeccionar el reporte.
 * @throws {Error} Cuando el archivo no tiene hojas para analizar.
 */
function inspectReport(reportPath) {
  const workbook = XLSX.readFile(reportPath, { cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('El reporte no contiene hojas para procesar');
  }
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
    raw: true
  });
  if (!rows.length) {
    return {
      graded: false,
      gradeStatus: 'Reporte sin información',
      gradeDate: null,
      gradedRows: [],
      pendingRows: []
    };
  }

  const headers = rows[0].map(value => (value == null ? '' : String(value)));
  const statusIndex = findHeaderIndex(headers, header =>
    header.includes('estado') && header.includes('calific')
  );
  const fallbackStatusIndex = statusIndex === -1
    ? findHeaderIndex(headers, header =>
        header.includes('estado') && header.includes('juicio')
      )
    : statusIndex;
  const resolvedStatusIndex = fallbackStatusIndex === -1
    ? findHeaderIndex(headers, header => header.includes('estado'))
    : fallbackStatusIndex;

  const dateIndex = findHeaderIndex(headers, header =>
    header.includes('fecha') && header.includes('calific')
  );
  const fallbackDateIndex = dateIndex === -1
    ? findHeaderIndex(headers, header => header.includes('fecha'))
    : dateIndex;
  const resolvedDateIndex = fallbackDateIndex;

  const gradedRows = [];
  const pendingRows = [];
  const qualifiableDateIndexes = findHeaderIndexes(
    headers,
    header => header.includes('fecha') && header.includes('calificable')
  );

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    if (!Array.isArray(row)) {
      continue;
    }
    const stateValue = resolvedStatusIndex >= 0 ? row[resolvedStatusIndex] : null;
    const normalized = normalizeText(stateValue);
    if (!normalized) {
      continue;
    }
    if (normalized.includes('sin calific') || normalized.includes('pendiente')) {
      pendingRows.push({ row, state: stateValue });
    } else if (normalized.includes('calific') || normalized.includes('aprob')) {
      gradedRows.push({ row, state: stateValue });
    }
  }

  const graded = gradedRows.length > 0 && pendingRows.length === 0;
  let gradeDate = null;
  let qualifiableDate = null;

  if (graded && resolvedDateIndex >= 0) {
    gradedRows.forEach(({ row }) => {
      const value = row[resolvedDateIndex];
      const parsed = parseExcelDate(value);
      if (parsed && (!gradeDate || parsed > gradeDate)) {
        gradeDate = parsed;
      }
    });
  }

  if (qualifiableDateIndexes.length > 0) {
    for (let i = 1; i < rows.length; i += 1) {
      const row = rows[i];
      if (!Array.isArray(row)) {
        continue;
      }
      for (const index of qualifiableDateIndexes) {
        const value = row[index];
        const parsed = parseExcelDate(value);
        if (parsed && (!qualifiableDate || parsed > qualifiableDate)) {
          qualifiableDate = parsed;
        }
      }
    }
  }

  const gradeStatus = graded
    ? 'Calificado'
    : pendingRows.length > 0
      ? 'Pendiente de Calificación'
      : 'Sin información de calificación';

  return {
    graded,
    gradeStatus,
    gradeDate,
    qualifiableDate,
    gradedRows,
    pendingRows,
    statusIndex: resolvedStatusIndex,
    dateIndex: resolvedDateIndex
  };
}

/**
 * Notifica al instructor responsable de una ficha cuando no se detecta
 * calificación final en el reporte descargado.
 *
 * @param {{
 *   instructor: { email?: string, emailpersonal?: string, name?: string } | null,
 *   ficheNumber: string,
 *   gradeInfo: { gradeStatus: string, gradeDate: Date | null }
 * }} options - Información necesaria para componer y enviar el correo.
 * @returns {Promise<void>} Promesa que se resuelve tras enviar (u omitir) el
 *   correo electrónico.
 */
async function notifyInstructor({
  instructor,
  ficheNumber,
  gradeInfo
}) {
  if (!cfg.mailEnabled) {
    console.log(`Notificación omitida para ficha ${ficheNumber}; correo deshabilitado.`);
    return;
  }
  if (!cfg.emailUser || !cfg.emailPass) {
    console.warn('No se ha configurado EMAIL_USER o EMAIL_PASS. No se enviará correo.');
    return;
  }
  const recipient =
    cfg.testMailRecipient || instructor?.email || instructor?.emailpersonal;
  if (!recipient) {
    console.warn(`No hay correo configurado para el instructor de la ficha ${ficheNumber}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: cfg.smtpHost || 'smtp.gmail.com',
    port: Number(cfg.smtpPort) || 465,
    secure: Number(cfg.smtpPort) === 465,
    auth: {
      user: cfg.emailUser,
      pass: cfg.emailPass
    }
  });

  const gradeDate = gradeInfo.gradeDate
    ? gradeInfo.gradeDate.toLocaleString('es-CO', { timeZone: 'America/Bogota' })
    : 'No registrada';

  const subject = `Ficha ${ficheNumber} - Estado de calificación`;
  const text = `Hola ${instructor?.name || ''},\n\n` +
    `El sistema revisó el reporte de la ficha ${ficheNumber} y determinó el estado "${gradeInfo.gradeStatus}".` +
    `\nFecha de calificación: ${gradeDate}.\n\n` +
    'Este es un mensaje automático generado por el proceso diario de seguimiento de horarios.';
  const html = `<p>Hola ${instructor?.name || ''},</p>` +
    `<p>El sistema revisó el reporte de la ficha <strong>${ficheNumber}</strong> y determinó el estado <strong>${gradeInfo.gradeStatus}</strong>.</p>` +
    `<p>Fecha de calificación: <strong>${gradeDate}</strong></p>` +
    '<p>Este es un mensaje automático generado por el proceso diario de seguimiento de horarios.</p>';

  await transporter.sendMail({
    from: cfg.emailUser,
    to: recipient,
    subject,
    text,
    html
  });
}

/**
 * Proceso principal que descarga los reportes de horarios desde Sofía Plus y
 * actualiza el estado de calificación en la base de datos institucional.
 *
 * @returns {Promise<void>} Promesa que se resuelve cuando el proceso finaliza.
 */
export async function processSchedules() {
  // Conexión a MongoDB para acceder a fichas, instructores y horarios.
  const mongoUri = cfg.mongoUrl;
  await mongoose.connect(mongoUri);
  console.log(`Conectado a MongoDB en ${mongoUri}`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limitDate = new Date(today);
  limitDate.setDate(limitDate.getDate() - 5);

  // Ejecución de la agregación para identificar fichas con horarios pendientes.
  const groups = await fetchPendingScheduleGroups(limitDate);
  const groupsToProcess = groups.slice(0, MAX_GROUPS_TO_PROCESS);

  if (!groups.length) {
    console.log('No se encontraron horarios pendientes de calificación.');
    await mongoose.disconnect();
    return;
  }

  console.log(
    `Se encontraron ${groups.length} fichas con horarios pendientes de calificación.`
  );

  const pendingGroups = groups.length - groupsToProcess.length;
  console.log(
    `Se procesarán ${groupsToProcess.length} fichas${
      pendingGroups > 0
        ? ` y quedarán ${pendingGroups} pendientes para la siguiente ejecución`
        : ''
    }.`
  );

  const { browser, page } = await iniciarSesion();

  try {
    // Procesamiento por ficha: descargar reporte e interpretar estado.
    for (const group of groupsToProcess) {
      const logData = {
        fiche: group.ficheId,
        ficheNumber: group.ficheNumber,
        instructor: group.instructorId,
        instructorName: group.instructorName,
        instructorEmail: group.instructorEmail || group.instructorEmailPersonal,
        scheduleIds: group.scheduleIds,
        scheduleCount: group.scheduleCount,
        graded: false,
        gradeStatus: 'No procesado',
        gradeDate: null,
        qualifiable: true,
        qualifiableDate: null,
        result: '',
        reportFile: '',
        notificationSentAt: null
      };

      try {
        const codigoFicha = group.ficheNumber;
        if (!codigoFicha) {
          throw new Error('La ficha no tiene número asignado.');
        }

        const reportPath = await descargarReporte(page, codigoFicha);
        logData.reportFile = path.basename(reportPath);

        const gradeInfo = inspectReport(reportPath);
        logData.graded = gradeInfo.graded;
        logData.gradeStatus = gradeInfo.gradeStatus;
        logData.gradeDate = gradeInfo.gradeDate || null;
        const rawQualifiableDate = gradeInfo.qualifiableDate || null;
        const normalizedQualifiableDate = rawQualifiableDate
          ? new Date(rawQualifiableDate)
          : null;
        if (normalizedQualifiableDate) {
          normalizedQualifiableDate.setHours(0, 0, 0, 0);
        }
        logData.qualifiableDate = normalizedQualifiableDate;

        if (gradeInfo.graded) {
          logData.qualifiable = true;
          logData.qualifiableDate = null;
          // Actualización de horarios cuando se confirma calificación en el reporte.
          await Schedule.updateMany(
            { _id: { $in: group.scheduleIds } },
            {
              $set: {
                calificado: true,
                calificable: true,
                fechaCalificacion: gradeInfo.gradeDate || new Date(),
                estadoCalificacion: gradeInfo.gradeStatus,
                calificadoPorProceso: 'processSchedules'
              },
              $unset: { fechaCalificable: '' }
            }
          );
          logData.result = 'Horarios actualizados como calificados';
        } else {
          let qualifiableFuture = false;
          if (normalizedQualifiableDate) {
            qualifiableFuture = normalizedQualifiableDate > today;
          }

          logData.qualifiable = !qualifiableFuture;

          await Schedule.updateMany(
            { _id: { $in: group.scheduleIds } },
            {
              $set: {
                calificado: false,
                calificable: !qualifiableFuture,
                fechaCalificacion: gradeInfo.gradeDate || null,
                estadoCalificacion: gradeInfo.gradeStatus,
                calificadoPorProceso: 'processSchedules'
              },
              $unset: { fechaCalificable: '' }
            }
          );

          if (qualifiableFuture) {
            logData.result =
              'Reporte con fecha calificable futura; seguimiento pospuesto';
          } else {
            logData.result = NOTIFICATION_RESULT_MESSAGE;
            logData.notificationSentAt = new Date();

            // Notificación al instructor para solicitar revisión o calificación pendiente.
            await notifyInstructor({
              instructor: {
                email: group.instructorEmail,
                emailpersonal: group.instructorEmailPersonal,
                name: group.instructorName
              },
              ficheNumber: codigoFicha,
              gradeInfo
            });
          }
        }

        // Registro del resultado de cada ficha para auditoría del proceso.
        await DailyProcessingLog.create(logData);
      } catch (error) {
        console.error(`Error procesando la ficha ${group.ficheNumber}:`, error);
        logData.errorMessage = error.message;
        logData.gradeStatus = 'Error en el procesamiento';
        logData.result = 'No fue posible actualizar el estado';
        // Persistencia del error encontrado durante el procesamiento.
        await DailyProcessingLog.create(logData);
      }
    }
  } finally {
    // Cierre de recursos independientemente del resultado del procesamiento.
    await browser.close();
    await mongoose.disconnect();
  }
}

export default processSchedules;

const currentFilePath = fileURLToPath(import.meta.url);
const isExecutedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === currentFilePath;

if (isExecutedDirectly) {
  // Permite ejecutar el script directamente desde la línea de comandos.
  processSchedules()
    .then(() => {
      console.log('Procesamiento de horarios finalizado.');
    })
    .catch(error => {
      console.error('El procesamiento de horarios finalizó con errores:', error);
      process.exitCode = 1;
    });
}
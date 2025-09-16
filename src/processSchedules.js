import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx/xlsx.mjs';
import nodemailer from 'nodemailer';
import { iniciarSesion, descargarReporte } from './loginDownload.js';
import { cfg } from './config.js';
import Schedule from '../Pruebas-bugs/models/Schedule.js';
import Fiche from '../Pruebas-bugs/models/Fiche.js';
import Instructor from '../Pruebas-bugs/models/Instructor.js';

const { Schema } = mongoose;

XLSX.set_fs(fs);

const processingLogSchema = new Schema(
  {
    fiche: { type: Schema.Types.ObjectId, ref: 'Fiche', required: true },
    ficheNumber: { type: String, required: true },
    instructor: { type: Schema.Types.ObjectId, ref: 'Instructor' },
    instructorName: String,
    instructorEmail: String,
    scheduleIds: [{ type: Schema.Types.ObjectId, ref: 'Schedules' }],
    scheduleCount: Number,
    graded: Boolean,
    gradeStatus: String,
    gradeDate: Date,
    reportFile: String,
    result: String,
    errorMessage: String,
    processedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: 'dailyprocessinglogs'
  }
);

const DailyProcessingLog =
  mongoose.models.DailyProcessingLog ||
  mongoose.model('DailyProcessingLog', processingLogSchema);

function normalizeText(value) {
  if (value == null) {
    return '';
  }
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function findHeaderIndex(headers, predicate) {
  for (let i = 0; i < headers.length; i += 1) {
    const header = headers[i];
    if (!header) continue;
    const normalized = normalizeText(header);
    if (predicate(normalized)) {
      return i;
    }
  }
  return -1;
}

function parseExcelDate(value) {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) {
      return null;
    }
    return new Date(
      parsed.y,
      (parsed.m || 1) - 1,
      parsed.d || 1,
      parsed.H || 0,
      parsed.M || 0,
      parsed.S || 0
    );
  }
  if (typeof value === 'string') {
    const timestamp = Date.parse(value);
    if (!Number.isNaN(timestamp)) {
      return new Date(timestamp);
    }
  }
  return null;
}

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

  if (graded && resolvedDateIndex >= 0) {
    gradedRows.forEach(({ row }) => {
      const value = row[resolvedDateIndex];
      const parsed = parseExcelDate(value);
      if (parsed && (!gradeDate || parsed > gradeDate)) {
        gradeDate = parsed;
      }
    });
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
    gradedRows,
    pendingRows,
    statusIndex: resolvedStatusIndex,
    dateIndex: resolvedDateIndex
  };
}

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
  const recipient = instructor?.email || instructor?.emailpersonal;
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

export async function processSchedules() {
  const mongoUri = 'mongodb://localhost:27017/adso076';
  await mongoose.connect(mongoUri);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limitDate = new Date(today);
  limitDate.setDate(limitDate.getDate() - 5);

  const groups = await Schedule.aggregate([
    {
      $match: {
        $and: [
          { fend: { $lte: limitDate } },
          {
            $or: [
              { calificado: { $exists: false } },
              { calificado: false },
              { calificado: null }
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
  ]);

  if (!groups.length) {
    console.log('No se encontraron horarios pendientes de calificación.');
    await mongoose.disconnect();
    return;
  }

  const { browser, page } = await iniciarSesion();

  try {
    for (const group of groups) {
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
        result: '',
        reportFile: ''
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

        if (gradeInfo.graded) {
          await Schedule.updateMany(
            { _id: { $in: group.scheduleIds } },
            {
              $set: {
                calificado: true,
                fechaCalificacion: gradeInfo.gradeDate || new Date(),
                estadoCalificacion: gradeInfo.gradeStatus,
                calificadoPorProceso: 'processSchedules'
              }
            }
          );
          logData.result = 'Horarios actualizados como calificados';

          await notifyInstructor({
            instructor: {
              email: group.instructorEmail,
              emailpersonal: group.instructorEmailPersonal,
              name: group.instructorName
            },
            ficheNumber: codigoFicha,
            gradeInfo
          });
        } else {
          logData.result = 'Reporte sin calificación confirmada';
        }

        await DailyProcessingLog.create(logData);
      } catch (error) {
        console.error(`Error procesando la ficha ${group.ficheNumber}:`, error);
        logData.errorMessage = error.message;
        logData.gradeStatus = 'Error en el procesamiento';
        logData.result = 'No fue posible actualizar el estado';
        await DailyProcessingLog.create(logData);
      }
    }
  } finally {
    await browser.close();
    await mongoose.disconnect();
  }
}

export default processSchedules;

const currentFilePath = fileURLToPath(import.meta.url);
const isExecutedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === currentFilePath;

if (isExecutedDirectly) {
  processSchedules()
    .then(() => {
      console.log('Procesamiento de horarios finalizado.');
    })
    .catch(error => {
      console.error('El procesamiento de horarios finalizó con errores:', error);
      process.exitCode = 1;
    });
}
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import { cfg } from '../config.js';
import DailyProcessingLog, {
  NOTIFICATION_RESULT_MESSAGE
} from '../models/DailyProcessingLog.js';
import {
  getPendingScheduleGroups,
  updateSchedulesAsGraded,
  updateSchedulesAsPending
} from '../services/scheduleService.js';
import { analyzeReport } from '../services/reportAnalyzer.js';
import { sendInstructorNotification } from '../services/notificationService.js';
import SofiaPlusClient from '../clients/sofiaPlusClient.js';

const MAX_GROUPS_TO_PROCESS = 3;

export async function run() {
  const mongoUri = cfg.mongoUrl;
  await mongoose.connect(mongoUri);
  console.log(`Conectado a MongoDB en ${mongoUri}`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limitDate = new Date(today);
  limitDate.setDate(limitDate.getDate() - 5);

  const groups = await getPendingScheduleGroups(limitDate);
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

  const client = new SofiaPlusClient();
  await client.login();

  try {
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

        const reportPath = await client.downloadReport(codigoFicha);
        logData.reportFile = path.basename(reportPath);

        const gradeInfo = analyzeReport(reportPath);
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
          await updateSchedulesAsGraded(group.scheduleIds, gradeInfo);
          logData.result = 'Horarios actualizados como calificados';
        } else {
          const qualifiableFuture =
            normalizedQualifiableDate && normalizedQualifiableDate > today;

          logData.qualifiable = !qualifiableFuture;

          await updateSchedulesAsPending(group.scheduleIds, gradeInfo, {
            qualifiableFuture: Boolean(qualifiableFuture)
          });

          if (qualifiableFuture) {
            logData.result =
              'Reporte con fecha calificable futura; seguimiento pospuesto';
          } else {
            logData.result = NOTIFICATION_RESULT_MESSAGE;
            logData.notificationSentAt = new Date();

            await sendInstructorNotification({
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
    await client.close();
    await mongoose.disconnect();
  }
}

export default run;

const currentFilePath = fileURLToPath(import.meta.url);
const isExecutedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === currentFilePath;

if (isExecutedDirectly) {
  run()
    .then(() => {
      console.log('Procesamiento de horarios finalizado.');
    })
    .catch(error => {
      console.error('El procesamiento de horarios finalizó con errores:', error);
      process.exitCode = 1;
    });
}
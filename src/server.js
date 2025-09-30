import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import DailyProcessingLog, {
  NOTIFICATION_RESULT_MESSAGE
} from './models/DailyProcessingLog.js';
import { cfg } from './config.js';

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const publicDir = path.resolve(currentDir, '..', 'public');

app.use(express.static(publicDir));

app.get('/notifications/emails', async (req, res) => {
  try {
    const { startDate, endDate, ficheNumber } = req.query;

    const parsedStartDate = startDate ? new Date(startDate) : null;
    if (parsedStartDate && Number.isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({ message: 'Parámetro startDate inválido.' });
    }

    const parsedEndDate = endDate ? new Date(endDate) : null;
    if (parsedEndDate && Number.isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({ message: 'Parámetro endDate inválido.' });
    }

    const query = {
      $or: [
        { notificationSentAt: { $exists: true, $ne: null } },
        { result: NOTIFICATION_RESULT_MESSAGE }
      ]
    };

    if (ficheNumber) {
      query.ficheNumber = new RegExp(`^${ficheNumber}`, 'i');
    }

    const logs = await DailyProcessingLog.find(query)
      .sort({ notificationSentAt: -1, processedAt: -1 })
      .lean();

    const filteredLogs = logs.filter(log => {
      const eventDate = log.notificationSentAt || log.processedAt;

      if (parsedStartDate && eventDate < parsedStartDate) {
        return false;
      }
      if (parsedEndDate && eventDate > parsedEndDate) {
        return false;
      }
      return true;
    });

    const response = filteredLogs.map(log => ({
      ficheNumber: log.ficheNumber,
      instructorName: log.instructorName,
      instructorEmail: log.instructorEmail,
      gradeStatus: log.gradeStatus,
      gradeDate: log.gradeDate,
      reportFile: log.reportFile,
      processedAt: log.processedAt
    }));

    res.json(response);
  } catch (error) {
    console.error('Error al consultar los logs de notificaciones:', error);
    res.status(500).json({ message: 'No se pudieron recuperar las notificaciones.' });
  }
});

async function bootstrap() {
  try {
    await mongoose.connect(cfg.mongoUrl);
    console.log('Conexión a MongoDB establecida.');

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
      console.log('Interfaz de notificaciones disponible en /notifications.html');
    });
  } catch (error) {
    console.error('No fue posible iniciar el servidor:', error);
    process.exitCode = 1;
  }
}

bootstrap();

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoose.disconnect();
  process.exit(0);
});
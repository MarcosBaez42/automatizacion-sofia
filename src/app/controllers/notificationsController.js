import { findEmailNotificationLogs } from '../../services/notificationLogService.js';

function parseDateParam(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export async function getEmailNotifications(req, res) {
  try {
    const { startDate, endDate, ficheNumber } = req.query;

    const parsedStartDate = parseDateParam(startDate);
    if (startDate && parsedStartDate === undefined) {
      return res
        .status(400)
        .json({ message: 'Parámetro startDate inválido.' });
    }

    const parsedEndDate = parseDateParam(endDate);
    if (endDate && parsedEndDate === undefined) {
      return res.status(400).json({ message: 'Parámetro endDate inválido.' });
    }

    const notifications = await findEmailNotificationLogs({
      startDate: parsedStartDate ?? null,
      endDate: parsedEndDate ?? null,
      ficheNumber: ficheNumber ? ficheNumber.trim() : ''
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error al consultar los logs de notificaciones:', error);
    res
      .status(500)
      .json({ message: 'No se pudieron recuperar las notificaciones.' });
  }
}
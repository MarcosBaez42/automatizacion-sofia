import DailyProcessingLog, {
  NOTIFICATION_RESULT_MESSAGE
} from '../models/DailyProcessingLog.js';

function buildQuery(ficheNumber) {
  const query = {
    $or: [
      { notificationSentAt: { $exists: true, $ne: null } },
      { result: NOTIFICATION_RESULT_MESSAGE }
    ]
  };

  if (ficheNumber) {
    query.ficheNumber = new RegExp(`^${ficheNumber}`, 'i');
  }

  return query;
}

function isWithinRange(log, startDate, endDate) {
  const eventDate = log.notificationSentAt || log.processedAt;

  if (startDate && eventDate < startDate) {
    return false;
  }

  if (endDate && eventDate > endDate) {
    return false;
  }

  return true;
}

function mapLogToResponse(log) {
  return {
    ficheNumber: log.ficheNumber,
    instructorName: log.instructorName,
    instructorEmail: log.instructorEmail,
    gradeStatus: log.gradeStatus,
    gradeDate: log.gradeDate,
    reportFile: log.reportFile,
    processedAt: log.processedAt
  };
}

export async function findEmailNotificationLogs({
  startDate,
  endDate,
  ficheNumber
}) {
  const query = buildQuery(ficheNumber);

  const logs = await DailyProcessingLog.find(query)
    .sort({ notificationSentAt: -1, processedAt: -1 })
    .lean();

  return logs
    .filter(log => isWithinRange(log, startDate, endDate))
    .map(mapLogToResponse);
}
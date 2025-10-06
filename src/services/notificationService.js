import nodemailer from 'nodemailer';
import { cfg } from '../config.js';

export async function sendInstructorNotification({
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
  const text =
    `Hola ${instructor?.name || ''},\n\n` +
    `El sistema revisó el reporte de la ficha ${ficheNumber} y determinó el estado "${gradeInfo.gradeStatus}".` +
    `\nFecha de calificación: ${gradeDate}.\n\n` +
    'Este es un mensaje automático generado por el proceso diario de seguimiento de horarios.';
  const html =
    `<p>Hola ${instructor?.name || ''},</p>` +
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
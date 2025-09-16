import 'dotenv/config';

export const cfg = {
  sofiaUser: process.env.SOFIA_USER,
  sofiaPass: process.env.SOFIA_PASS,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT || 587,
  juiciosApiUrl: process.env.JUICIOS_API_URL,
  outputDir: './downloads',
  codigosFicha: (process.env.CODIGOS_FICHA || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),
  mailEnabled: process.env.MAIL_ENABLED === 'true'
};
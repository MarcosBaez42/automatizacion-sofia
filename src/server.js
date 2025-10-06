import mongoose from 'mongoose';
import createApp from './app/createApp.js';
import { cfg } from './config.js';

const PORT = process.env.PORT || 3000;
const app = createApp();
let server;

async function connectToDatabase() {
  await mongoose.connect(cfg.mongoUrl);
  console.log('Conexión a MongoDB establecida.');
}

async function disconnectFromDatabase() {
  await mongoose.disconnect();
  console.log('Conexión a MongoDB cerrada.');
}

async function startServer() {
  try {
    await connectToDatabase();

    server = app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
      console.log('Interfaz de notificaciones disponible en /notifications.html');
    });
  } catch (error) {
    console.error('No fue posible iniciar el servidor:', error);
    process.exitCode = 1;
  }
}

async function shutdown(signal) {
  console.log(`Recibida señal ${signal}. Cerrando servidor...`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close(error => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
      server = undefined;
      console.log('Servidor HTTP detenido.');
    }

    await disconnectFromDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Error durante el apagado del servidor:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
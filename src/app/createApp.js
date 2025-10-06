import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import notificationsRouter from './routes/notificationsRouter.js';

function resolvePublicDir() {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFilePath);
  return path.resolve(currentDir, '..', '..', 'public');
}

export default function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.static(resolvePublicDir()));

  app.use('/notifications', notificationsRouter);

  return app;
}
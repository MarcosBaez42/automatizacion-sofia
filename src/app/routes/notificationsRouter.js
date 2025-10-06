import { Router } from 'express';
import { getEmailNotifications } from '../controllers/notificationsController.js';

const router = Router();

router.get('/emails', getEmailNotifications);

export default router;
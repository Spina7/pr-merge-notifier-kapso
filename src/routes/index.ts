import { Router } from 'express';
import { handleGithubWebhook } from '../controllers/webhookController.js';
import { getMetrics } from '../controllers/metricsController.js';

const router = Router();

router.post('/webhook/github', handleGithubWebhook);
router.get('/metrics', getMetrics);

export default router;

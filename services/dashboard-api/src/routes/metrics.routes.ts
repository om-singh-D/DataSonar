import { Router, Request, Response } from 'express';
import { getOverviewMetrics, getVolumeMetrics } from '../services/metrics.service';
import { logger } from '../utils/logger';

const router = Router();

router.get('/overview', async (_req: Request, res: Response) => {
  try {
    const metrics = await getOverviewMetrics();
    res.json(metrics);
  } catch (err) {
    logger.error('Failed to get overview metrics', { error: (err as Error).message });
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

router.get('/volume', async (_req: Request, res: Response) => {
  try {
    const volume = await getVolumeMetrics();
    res.json(volume);
  } catch (err) {
    logger.error('Failed to get volume metrics', { error: (err as Error).message });
    res.status(500).json({ error: 'Failed to fetch volume metrics' });
  }
});

export default router;

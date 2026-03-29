import { Router, Request, Response } from 'express';
import { listAlerts, resolveAlert } from '../services/alerts.service';
import { logger } from '../utils/logger';

const router = Router();

function firstString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const filters = {
      severity: firstString(req.query.severity as string | string[] | undefined),
      status: firstString(req.query.status as string | string[] | undefined),
      limit: firstString(req.query.limit as string | string[] | undefined)
        ? parseInt(firstString(req.query.limit as string | string[] | undefined) as string, 10)
        : undefined,
      offset: firstString(req.query.offset as string | string[] | undefined)
        ? parseInt(firstString(req.query.offset as string | string[] | undefined) as string, 10)
        : undefined,
    };
    const result = await listAlerts(filters);
    res.json(result);
  } catch (err) {
    logger.error('Failed to list alerts', { error: (err as Error).message });
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.patch('/:id/resolve', async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const success = await resolveAlert(id);
    if (!success) {
      res.status(404).json({ error: 'Alert not found or already resolved' });
      return;
    }
    res.json({ ok: true, message: 'Alert resolved' });
  } catch (err) {
    logger.error('Failed to resolve alert', { id: req.params.id, error: (err as Error).message });
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

export default router;

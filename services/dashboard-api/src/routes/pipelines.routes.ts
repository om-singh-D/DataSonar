import { Router, Request, Response } from 'express';
import { listPipelines, getPipelineDetail } from '../services/pipelines.service';
import { logger } from '../utils/logger';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const pipelines = await listPipelines();
    res.json(pipelines);
  } catch (err) {
    logger.error('Failed to list pipelines', { error: (err as Error).message });
    res.status(500).json({ error: 'Failed to fetch pipelines' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const detail = await getPipelineDetail(id);
    if (!detail) {
      res.status(404).json({ error: 'Pipeline not found' });
      return;
    }
    res.json(detail);
  } catch (err) {
    logger.error('Failed to get pipeline detail', { id: req.params.id, error: (err as Error).message });
    res.status(500).json({ error: 'Failed to fetch pipeline details' });
  }
});

export default router;

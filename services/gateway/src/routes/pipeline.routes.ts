import { Router } from 'express';
import { PipelineController } from '../controllers/pipeline.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { CreatePipelineSchema, UpdatePipelineSchema } from '../schemas/pipeline.schema';

const router = Router();
const controller = new PipelineController();

// All pipeline routes require authentication
router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getById);

// Create/Update/Delete require EDITOR or ADMIN
router.post('/', authorize('ADMIN', 'EDITOR'), validate(CreatePipelineSchema), controller.create);
router.patch('/:id', authorize('ADMIN', 'EDITOR'), validate(UpdatePipelineSchema), controller.update);
router.delete('/:id', authorize('ADMIN'), controller.delete);

export default router;

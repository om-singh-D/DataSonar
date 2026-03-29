import { Router } from 'express';
import { AlertConfigController } from '../controllers/alertconfig.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const controller = new AlertConfigController();

// All alert config routes require authentication
router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  RegisterSchema,
  LoginSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
} from '../schemas/auth.schema';

const router = Router();
const controller = new AuthController();

// Public routes
router.post('/register', validate(RegisterSchema), controller.register);
router.post('/login', validate(LoginSchema), controller.login);

// Protected routes
router.get('/profile', authenticate, controller.getProfile);
router.patch('/profile', authenticate, validate(UpdateProfileSchema), controller.updateProfile);
router.post('/change-password', authenticate, validate(ChangePasswordSchema), controller.changePassword);

export default router;
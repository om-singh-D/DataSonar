import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { ApiKeyController } from '../controllers/apikey.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  RegisterSchema,
  LoginSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
} from '../schemas/auth.schema';

const router = Router();
const authController = new AuthController();
const apiKeyController = new ApiKeyController();

// Public routes
router.post('/register', validate(RegisterSchema), authController.register);
router.post('/login', validate(LoginSchema), authController.login);
router.post('/refresh', authController.refresh);

// Protected auth routes
router.get('/profile', authenticate, authController.getProfile);
router.patch('/profile', authenticate, validate(UpdateProfileSchema), authController.updateProfile);
router.post('/change-password', authenticate, validate(ChangePasswordSchema), authController.changePassword);

// API key management
router.post('/api-keys', authenticate, apiKeyController.create);
router.get('/api-keys', authenticate, apiKeyController.list);
router.delete('/api-keys/:id', authenticate, apiKeyController.revoke);

export default router;
import { Request, Response } from 'express';
import { AuthService, AppError } from '../services/auth.service';
import { logger } from '../utils/logger';

const authService = new AuthService();

export class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body);

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
          user: result.user,
          tokens: result.tokens,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: 'error',
          message: error.message,
        });
        return;
      }

      logger.error('Registration failed', { error });
      res.status(500).json({
        status: 'error',
        message: 'Registration failed',
      });
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(
        req.body,
        req.ip,
        req.headers['user-agent']
      );

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: result.user,
          tokens: result.tokens,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: 'error',
          message: error.message,
        });
        return;
      }

      logger.error('Login failed', { error });
      res.status(500).json({
        status: 'error',
        message: 'Login failed',
      });
    }
  }

  /**
   * GET /api/v1/auth/profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = await authService.getProfile(req.user!.userId);

      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: 'error',
          message: error.message,
        });
        return;
      }

      logger.error('Get profile failed', { error });
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch profile',
      });
    }
  }

  /**
   * PATCH /api/v1/auth/profile
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = await authService.updateProfile(req.user!.userId, req.body);

      res.status(200).json({
        status: 'success',
        message: 'Profile updated',
        data: { user },
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: 'error',
          message: error.message,
        });
        return;
      }

      logger.error('Update profile failed', { error });
      res.status(500).json({
        status: 'error',
        message: 'Failed to update profile',
      });
    }
  }

  /**
   * POST /api/v1/auth/change-password
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      await authService.changePassword(
        req.user!.userId,
        req.body.currentPassword,
        req.body.newPassword
      );

      res.status(200).json({
        status: 'success',
        message: 'Password changed successfully',
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: 'error',
          message: error.message,
        });
        return;
      }

      logger.error('Change password failed', { error });
      res.status(500).json({
        status: 'error',
        message: 'Failed to change password',
      });
    }
  }
}
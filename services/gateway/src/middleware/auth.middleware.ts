import { Request, Response, NextFunction } from 'express';
import { AuthService, JwtPayload, AppError } from '../services/auth.service';
import { Role } from '../generated/prisma/client';
import { logger } from '../utils/logger';

const authService = new AuthService();

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware: Require valid JWT token
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required. Provide Bearer token.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = authService.verifyToken(token);

    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
      return;
    }

    logger.error('Authentication error', { error });
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token',
    });
  }
}

/**
 * Middleware: Require specific role(s)
 */
export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.userId,
        requiredRoles: roles,
        userRole: req.user.role,
        path: req.path,
      });

      res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
}
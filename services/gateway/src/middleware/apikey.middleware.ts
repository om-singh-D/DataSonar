import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from '../services/apikey.service';
import { AppError } from '../services/auth.service';
import { logger } from '../utils/logger';
import { PrismaClient } from '../generated/prisma/client';

const apiKeyService = new ApiKeyService();
const prisma = new PrismaClient();

/**
 * Middleware: Allow authentication via X-Api-Key header.
 * Attaches req.user if key is valid, then calls next().
 * Use AFTER or INSTEAD OF the JWT authenticate middleware.
 */
export function authenticateApiKey(req: Request, res: Response, next: NextFunction): void {
  const rawKey = req.headers['x-api-key'] as string | undefined;

  if (!rawKey) {
    res.status(401).json({
      status: 'error',
      message: 'Authentication required. Provide Bearer token or X-Api-Key.',
    });
    return;
  }

  apiKeyService
    .validateApiKey(rawKey)
    .then(async ({ userId, scopes }) => {
      // Load user role for the authorize() middleware to work correctly
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(401).json({ status: 'error', message: 'User not found' });
        return;
      }
      req.user = { userId, email: user.email, role: user.role };
      next();
    })
    .catch((error) => {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ status: 'error', message: error.message });
        return;
      }
      logger.error('API key authentication error', { error });
      res.status(401).json({ status: 'error', message: 'Invalid API key' });
    });
}

/**
 * Middleware: Accept EITHER a JWT Bearer token OR an X-Api-Key header.
 * Useful for routes that should be accessible to both users and programmatic clients.
 */
export function authenticateAny(req: Request, res: Response, next: NextFunction): void {
  const hasBearerToken =
    req.headers.authorization && req.headers.authorization.startsWith('Bearer ');
  const hasApiKey = !!req.headers['x-api-key'];

  if (hasBearerToken) {
    // Delegate to the standard JWT authenticate middleware
    // We manually inline it here to avoid circular imports
    const { AuthService, AppError: AuthAppError } = require('../services/auth.service');
    const svc = new AuthService();
    try {
      const token = req.headers.authorization!.split(' ')[1];
      req.user = svc.verifyToken(token);
      next();
    } catch (e: unknown) {
      if (e instanceof AppError) {
        res.status(e.statusCode).json({ status: 'error', message: e.message });
        return;
      }
      res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
    }
  } else if (hasApiKey) {
    authenticateApiKey(req, res, next);
  } else {
    res.status(401).json({
      status: 'error',
      message: 'Authentication required. Provide Bearer token or X-Api-Key header.',
    });
  }
}

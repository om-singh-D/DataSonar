import { Request, Response } from 'express';
import { ApiKeyService } from '../services/apikey.service';
import { AppError } from '../services/auth.service';
import { logger } from '../utils/logger';
import { CreateApiKeySchema } from '../schemas/auth.schema';

const apiKeyService = new ApiKeyService();

export class ApiKeyController {
  /**
   * POST /api/v1/auth/api-keys
   * Generate a new API key. Returns rawKey ONCE — cannot be retrieved again.
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, scopes, expiresInDays } = CreateApiKeySchema.parse(req.body);
      const result = await apiKeyService.generateApiKey(
        req.user!.userId,
        name,
        scopes,
        expiresInDays
      );

      res.status(201).json({
        status: 'success',
        message: 'API key created. Store the rawKey securely — it will not be shown again.',
        data: result,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ status: 'error', message: error.message });
        return;
      }
      logger.error('Failed to create API key', { error });
      res.status(500).json({ status: 'error', message: 'Failed to create API key' });
    }
  }

  /**
   * GET /api/v1/auth/api-keys
   * List all API keys for the authenticated user.
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const keys = await apiKeyService.listApiKeys(req.user!.userId);
      res.status(200).json({ status: 'success', data: { apiKeys: keys } });
    } catch (error) {
      logger.error('Failed to list API keys', { error });
      res.status(500).json({ status: 'error', message: 'Failed to list API keys' });
    }
  }

  /**
   * DELETE /api/v1/auth/api-keys/:id
   * Revoke an API key.
   */
  async revoke(req: Request, res: Response): Promise<void> {
    try {
      await apiKeyService.revokeApiKey(req.params['id'] as string, req.user!.userId);
      res.status(200).json({ status: 'success', message: 'API key revoked successfully' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ status: 'error', message: error.message });
        return;
      }
      logger.error('Failed to revoke API key', { error });
      res.status(500).json({ status: 'error', message: 'Failed to revoke API key' });
    }
  }
}

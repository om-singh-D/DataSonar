import { Request, Response } from 'express';
import { PrismaClient, AlertChannel, AlertSeverity } from '../generated/prisma/client';
import { AppError } from '../services/auth.service';
import { logger } from '../utils/logger';
import { z } from 'zod';

const prisma = new PrismaClient();

const CreateAlertConfigSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  channel: z.enum(['EMAIL', 'SLACK', 'WEBHOOK']),
  destination: z.string().min(1, 'Destination is required').max(500),
  severityFilter: z.array(z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])).default(['HIGH', 'CRITICAL']),
  sourceFilter: z.array(z.string()).default([]),
  cooldownMinutes: z.number().int().min(1).max(1440).default(15),
});

const UpdateAlertConfigSchema = CreateAlertConfigSchema.partial();

export class AlertConfigController {
  /**
   * GET /api/v1/alert-configs
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const configs = await prisma.alertConfig.findMany({
        where: { userId: req.user!.userId },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json({ status: 'success', data: { alertConfigs: configs } });
    } catch (error) {
      logger.error('Failed to list alert configs', { error });
      res.status(500).json({ status: 'error', message: 'Failed to fetch alert configurations' });
    }
  }

  /**
   * GET /api/v1/alert-configs/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const config = await prisma.alertConfig.findUnique({
        where: { id },
      });

      if (!config) {
        res.status(404).json({ status: 'error', message: 'Alert configuration not found' });
        return;
      }

      if (config.userId !== req.user!.userId) {
        res.status(403).json({ status: 'error', message: 'Not authorized to view this config' });
        return;
      }

      res.status(200).json({ status: 'success', data: { alertConfig: config } });
    } catch (error) {
      logger.error('Failed to get alert config', { error });
      res.status(500).json({ status: 'error', message: 'Failed to fetch alert configuration' });
    }
  }

  /**
   * POST /api/v1/alert-configs
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = CreateAlertConfigSchema.parse(req.body);

      const config = await prisma.alertConfig.create({
        data: {
          ...data,
          channel: data.channel as AlertChannel,
          severityFilter: data.severityFilter as AlertSeverity[],
          userId: req.user!.userId,
        },
      });

      logger.info('Alert config created', { configId: config.id, userId: req.user!.userId });

      res.status(201).json({
        status: 'success',
        message: 'Alert configuration created',
        data: { alertConfig: config },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        });
        return;
      }
      logger.error('Failed to create alert config', { error });
      res.status(500).json({ status: 'error', message: 'Failed to create alert configuration' });
    }
  }

  /**
   * PATCH /api/v1/alert-configs/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const existing = await prisma.alertConfig.findUnique({
        where: { id },
      });

      if (!existing) {
        res.status(404).json({ status: 'error', message: 'Alert configuration not found' });
        return;
      }

      if (existing.userId !== req.user!.userId) {
        res.status(403).json({ status: 'error', message: 'Not authorized to update this config' });
        return;
      }

      const data = UpdateAlertConfigSchema.parse(req.body);

      const updated = await prisma.alertConfig.update({
        where: { id },
        data: {
          ...data,
          channel: data.channel as AlertChannel | undefined,
          severityFilter: data.severityFilter as AlertSeverity[] | undefined,
        },
      });

      res.status(200).json({
        status: 'success',
        message: 'Alert configuration updated',
        data: { alertConfig: updated },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        });
        return;
      }
      logger.error('Failed to update alert config', { error });
      res.status(500).json({ status: 'error', message: 'Failed to update alert configuration' });
    }
  }

  /**
   * DELETE /api/v1/alert-configs/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const existing = await prisma.alertConfig.findUnique({
        where: { id },
      });

      if (!existing) {
        res.status(404).json({ status: 'error', message: 'Alert configuration not found' });
        return;
      }

      if (existing.userId !== req.user!.userId) {
        res.status(403).json({ status: 'error', message: 'Not authorized to delete this config' });
        return;
      }

      await prisma.alertConfig.delete({ where: { id } });

      logger.info('Alert config deleted', { configId: id, userId: req.user!.userId });

      res.status(200).json({ status: 'success', message: 'Alert configuration deleted' });
    } catch (error) {
      logger.error('Failed to delete alert config', { error });
      res.status(500).json({ status: 'error', message: 'Failed to delete alert configuration' });
    }
  }
}

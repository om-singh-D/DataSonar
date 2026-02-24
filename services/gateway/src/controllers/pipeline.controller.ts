import { Request, Response } from 'express';
import { PrismaClient, Pipeline } from '../generated/prisma/client';
import { AppError } from '../services/auth.service';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class PipelineController {
  /**
   * GET /api/v1/pipelines
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = (page - 1) * limit;
      const status = req.query.status as string | undefined;

      const where = status ? { status: status as any } : {};

      const [pipelines, total] = await Promise.all([
        prisma.pipeline.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.pipeline.count({ where }),
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          pipelines: pipelines.map((p: Pipeline) => ({
            ...p,
            eventCount: p.eventCount.toString(), // BigInt serialization
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      logger.error('Failed to list pipelines', { error });
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch pipelines',
      });
    }
  }

  /**
   * GET /api/v1/pipelines/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const pipeline = await prisma.pipeline.findUnique({
        where: { id },
      });

      if (!pipeline) {
        res.status(404).json({
          status: 'error',
          message: 'Pipeline not found',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: {
          pipeline: {
            ...pipeline,
            eventCount: pipeline.eventCount.toString(),
          },
        },
      });
    } catch (error) {
      logger.error('Failed to get pipeline', { error });
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch pipeline',
      });
    }
  }

  /**
   * POST /api/v1/pipelines
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const existing = await prisma.pipeline.findUnique({
        where: { name: req.body.name },
      });

      if (existing) {
        res.status(409).json({
          status: 'error',
          message: 'Pipeline with this name already exists',
        });
        return;
      }

      const pipeline = await prisma.pipeline.create({
        data: {
          name: req.body.name,
          description: req.body.description,
          sourceType: req.body.sourceType,
          sourceConfig: req.body.sourceConfig,
        },
      });

      logger.info('Pipeline created', {
        pipelineId: pipeline.id,
        name: pipeline.name,
        createdBy: req.user!.userId,
      });

      res.status(201).json({
        status: 'success',
        message: 'Pipeline created',
        data: {
          pipeline: {
            ...pipeline,
            eventCount: pipeline.eventCount.toString(),
          },
        },
      });
    } catch (error) {
      logger.error('Failed to create pipeline', { error });
      res.status(500).json({
        status: 'error',
        message: 'Failed to create pipeline',
      });
    }
  }

  /**
   * PATCH /api/v1/pipelines/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const existing = await prisma.pipeline.findUnique({
        where: { id },
      });

      if (!existing) {
        res.status(404).json({
          status: 'error',
          message: 'Pipeline not found',
        });
        return;
      }

      const pipeline = await prisma.pipeline.update({
        where: { id },
        data: req.body,
      });

      logger.info('Pipeline updated', {
        pipelineId: pipeline.id,
        updatedBy: req.user!.userId,
      });

      res.status(200).json({
        status: 'success',
        message: 'Pipeline updated',
        data: {
          pipeline: {
            ...pipeline,
            eventCount: pipeline.eventCount.toString(),
          },
        },
      });
    } catch (error) {
      logger.error('Failed to update pipeline', { error });
      res.status(500).json({
        status: 'error',
        message: 'Failed to update pipeline',
      });
    }
  }

  /**
   * DELETE /api/v1/pipelines/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const existing = await prisma.pipeline.findUnique({
        where: { id },
      });

      if (!existing) {
        res.status(404).json({
          status: 'error',
          message: 'Pipeline not found',
        });
        return;
      }

      await prisma.pipeline.delete({
        where: { id },
      });

      logger.info('Pipeline deleted', {
        pipelineId: id,
        deletedBy: req.user!.userId,
      });

      res.status(200).json({
        status: 'success',
        message: 'Pipeline deleted',
      });
    } catch (error) {
      logger.error('Failed to delete pipeline', { error });
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete pipeline',
      });
    }
  }
}
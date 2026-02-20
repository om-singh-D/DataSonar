import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { PipelineEventSchema } from '../schemas/event.schema';
import { KafkaProducerService } from '../producers/kafka.producer';
import { logger } from '../utils/logger';
import { config } from '../config';

export class IngestionController {
  constructor(private kafkaProducer: KafkaProducerService) {}

  /**
   * POST /api/v1/ingest
   * Receives a pipeline data event, validates it, enriches it, and sends to Kafka
   */
  ingestEvent = async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();

    try {
      // 1. Validate the incoming payload
      const validationResult = PipelineEventSchema.safeParse(req.body);

      if (!validationResult.success) {
        const errors = validationResult.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        logger.warn('Event validation failed', {
          errors,
          sourceIp: req.ip,
        });

        // Send to dead letter queue for analysis
        await this.kafkaProducer.sendToDeadLetter(
          req.body,
          JSON.stringify(errors),
          req.ip
        );

        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors,
        });
        return;
      }

      // 2. Enrich the event
      const enrichedEvent = {
        ...validationResult.data,
        eventId: uuidv4(),
        receivedAt: new Date().toISOString(),
        ingestionService: config.service.name,
        validationStatus: 'valid' as const,
      };

      // 3. Send to Kafka
      await this.kafkaProducer.sendEvent(enrichedEvent);

      const processingTime = Date.now() - startTime;

      logger.info('Event ingested successfully', {
        eventId: enrichedEvent.eventId,
        sourceId: enrichedEvent.sourceId,
        recordCount: enrichedEvent.data.recordCount,
        processingTimeMs: processingTime,
      });

      // 4. Respond
      res.status(202).json({
        status: 'accepted',
        eventId: enrichedEvent.eventId,
        receivedAt: enrichedEvent.receivedAt,
        processingTimeMs: processingTime,
      });
    } catch (error) {
      logger.error('Ingestion failed', { error });

      res.status(500).json({
        status: 'error',
        message: 'Internal server error during ingestion',
      });
    }
  };

  /**
   * POST /api/v1/ingest/batch
   * Receives multiple events in a single request
   */
  ingestBatch = async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();

    try {
      const events = req.body.events;

      if (!Array.isArray(events) || events.length === 0) {
        res.status(400).json({
          status: 'error',
          message: 'Request body must contain a non-empty "events" array',
        });
        return;
      }

      if (events.length > 100) {
        res.status(400).json({
          status: 'error',
          message: 'Batch size cannot exceed 100 events',
        });
        return;
      }

      const results = {
        accepted: [] as string[],
        rejected: [] as { index: number; errors: unknown }[],
      };

      for (let i = 0; i < events.length; i++) {
        const validationResult = PipelineEventSchema.safeParse(events[i]);

        if (!validationResult.success) {
          results.rejected.push({
            index: i,
            errors: validationResult.error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          });

          await this.kafkaProducer.sendToDeadLetter(
            events[i],
            `Batch item ${i} validation failed`,
            req.ip
          );
          continue;
        }

        const enrichedEvent = {
          ...validationResult.data,
          eventId: uuidv4(),
          receivedAt: new Date().toISOString(),
          ingestionService: config.service.name,
          validationStatus: 'valid' as const,
        };

        await this.kafkaProducer.sendEvent(enrichedEvent);
        results.accepted.push(enrichedEvent.eventId);
      }

      const processingTime = Date.now() - startTime;

      logger.info('Batch ingestion completed', {
        total: events.length,
        accepted: results.accepted.length,
        rejected: results.rejected.length,
        processingTimeMs: processingTime,
      });

      res.status(202).json({
        status: 'completed',
        summary: {
          total: events.length,
          accepted: results.accepted.length,
          rejected: results.rejected.length,
        },
        acceptedEventIds: results.accepted,
        rejections: results.rejected,
        processingTimeMs: processingTime,
      });
    } catch (error) {
      logger.error('Batch ingestion failed', { error });

      res.status(500).json({
        status: 'error',
        message: 'Internal server error during batch ingestion',
      });
    }
  };

  /**
   * GET /health
   */
  healthCheck = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      status: 'healthy',
      service: config.service.name,
      kafka: this.kafkaProducer.getStatus() ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  };
}
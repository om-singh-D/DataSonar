import { MongoClient } from 'mongodb';
import { config } from '../config';
import { EnrichedEvent } from '../schemas/event.schema';
import { logger } from '../utils/logger';

export interface ValidationIssue {
  field: string;
  message: string;
}

export class DemoTelemetryService {
  private client: MongoClient | null = null;
  private connected = false;

  async connect(): Promise<void> {
    if (!config.telemetry.enabled) {
      logger.info('Demo telemetry is disabled');
      return;
    }

    try {
      this.client = new MongoClient(config.telemetry.mongoUri);
      await this.client.connect();
      this.connected = true;
      logger.info('Demo telemetry connected to MongoDB', {
        db: config.telemetry.mongoDbName,
      });
    } catch (error) {
      this.connected = false;
      logger.warn('Demo telemetry could not connect to MongoDB. Continuing without telemetry persistence.', {
        error,
      });
    }
  }

  async disconnect(): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      await this.client.close();
      this.connected = false;
      logger.info('Demo telemetry disconnected from MongoDB');
    } catch (error) {
      logger.warn('Failed to close demo telemetry MongoDB connection', { error });
    }
  }

  async recordAcceptedEvent(event: EnrichedEvent): Promise<void> {
    if (!this.connected || !this.client) {
      return;
    }

    try {
      const db = this.client.db(config.telemetry.mongoDbName);
      const qualityScores = db.collection('quality_scores');
      const pipelineSnapshots = db.collection('pipeline_snapshots');

      const timestamp = event.timestamp;
      const overallScore = 98;
      const eventVolume = event.data.recordCount;

      await qualityScores.insertOne({
        eventId: event.eventId,
        sourceId: event.sourceId,
        sourceName: event.sourceName,
        sourceType: event.sourceType,
        timestamp,
        receivedAt: event.receivedAt,
        eventVolume,
        overallScore,
        scores: {
          accuracy: 98,
          completeness: 99,
          consistency: 97,
          timeliness: 99,
          validity: 99,
          uniqueness: 96,
        },
      });

      await pipelineSnapshots.updateOne(
        { sourceId: event.sourceId },
        {
          $setOnInsert: {
            sourceId: event.sourceId,
            name: event.sourceName,
            sourceType: event.sourceType,
            createdAt: event.receivedAt,
          },
          $set: {
            lastEventAt: event.receivedAt,
            latestQualityScore: overallScore,
            status: 'ACTIVE',
          },
          $inc: {
            eventCount: eventVolume,
          },
        },
        { upsert: true }
      );
    } catch (error) {
      logger.warn('Failed to persist accepted event telemetry', {
        eventId: event.eventId,
        error,
      });
    }
  }

  async recordRejectedEvent(rawPayload: unknown, errors: ValidationIssue[], sourceIp?: string): Promise<void> {
    if (!this.connected || !this.client) {
      return;
    }

    try {
      const db = this.client.db(config.telemetry.mongoDbName);
      const alerts = db.collection('alerts');
      const anomalies = db.collection('anomalies');
      const pipelineSnapshots = db.collection('pipeline_snapshots');
      const qualityScores = db.collection('quality_scores');

      const payload = (rawPayload && typeof rawPayload === 'object' ? rawPayload as Record<string, unknown> : {}) || {};
      const payloadSourceId =
        typeof payload.sourceId === 'string' && payload.sourceId.length > 0
          ? payload.sourceId
          : null;
      const payloadSourceName =
        typeof payload.sourceName === 'string' && payload.sourceName.length > 0
          ? payload.sourceName
          : null;
      const payloadSourceType =
        typeof payload.sourceType === 'string' && payload.sourceType.length > 0
          ? payload.sourceType
          : null;

      let sourceId = payloadSourceId;
      let sourceName = payloadSourceName || payloadSourceId || 'unknown-source';
      let sourceType = payloadSourceType || 'stream';

      if (!sourceId && payloadSourceName) {
        const snapshot = await pipelineSnapshots.findOne(
          { name: payloadSourceName },
          { sort: { lastEventAt: -1 } }
        );

        if (snapshot && typeof snapshot.sourceId === 'string' && snapshot.sourceId.length > 0) {
          sourceId = snapshot.sourceId;
          sourceName =
            typeof snapshot.name === 'string' && snapshot.name.length > 0
              ? snapshot.name
              : payloadSourceName;
          sourceType =
            typeof snapshot.sourceType === 'string' && snapshot.sourceType.length > 0
              ? snapshot.sourceType
              : sourceType;
        }
      }

      if (!sourceId && payloadSourceName) {
        const latestQuality = await qualityScores.findOne(
          { sourceName: payloadSourceName },
          { sort: { timestamp: -1, scored_at: -1 } }
        );

        if (latestQuality && typeof latestQuality.sourceId === 'string' && latestQuality.sourceId.length > 0) {
          sourceId = latestQuality.sourceId;
          sourceName =
            typeof latestQuality.sourceName === 'string' && latestQuality.sourceName.length > 0
              ? latestQuality.sourceName
              : sourceName;
          sourceType =
            typeof latestQuality.sourceType === 'string' && latestQuality.sourceType.length > 0
              ? latestQuality.sourceType
              : sourceType;
        }
      }

      if (!sourceId) {
        sourceId = 'unknown-source';
      }

      const now = new Date().toISOString();
      const message = errors.length > 0
        ? errors.map((issue) => `${issue.field}: ${issue.message}`).join('; ')
        : 'Validation failed';

      await alerts.insertOne({
        sourceId,
        pipelineId: sourceId,
        severity: 'high',
        message,
        status: 'active',
        anomalyType: 'validation_error',
        createdAt: now,
        timestamp: now,
        sourceIp: sourceIp || 'unknown',
      });

      await anomalies.insertOne({
        sourceId,
        eventId: payload.eventId || null,
        anomalyType: 'validation_error',
        severity: 0.9,
        detectedAt: now,
        details: errors,
      });

      if (sourceId !== 'unknown-source') {
        await pipelineSnapshots.updateOne(
          { sourceId },
          {
            $setOnInsert: {
              sourceId,
              name: sourceName,
              sourceType,
              createdAt: now,
            },
            $set: {
              status: 'ERROR',
              lastEventAt: now,
            },
            $inc: {
              rejectedCount: 1,
            },
          },
          { upsert: true }
        );
      }
    } catch (error) {
      logger.warn('Failed to persist rejected event telemetry', {
        error,
      });
    }
  }
}

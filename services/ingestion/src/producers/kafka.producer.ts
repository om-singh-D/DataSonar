import { Kafka, Producer, Partitioners, CompressionTypes } from 'kafkajs';
import { config } from '../config';
import { logger } from '../utils/logger';
import { EnrichedEvent } from '../schemas/event.schema';

export class KafkaProducerService {
  private kafka: Kafka;
  private producer: Producer;
  private isConnected: boolean = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
      allowAutoTopicCreation: true,
      transactionalId: undefined,
    });
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      this.isConnected = true;
      logger.info('Kafka producer connected successfully', {
        brokers: config.kafka.brokers,
      });
    } catch (error) {
      logger.error('Failed to connect Kafka producer', { error });
      throw error;
    }
  }

  async sendEvent(event: EnrichedEvent): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Kafka producer is not connected');
    }

    try {
      await this.producer.send({
        topic: config.kafka.topics.rawEvents,
        compression: CompressionTypes.GZIP,
        messages: [
          {
            key: event.sourceId,
            value: JSON.stringify(event),
            headers: {
              'event-type': event.eventType,
              'source-id': event.sourceId,
              'event-id': event.eventId,
              'received-at': event.receivedAt,
            },
          },
        ],
      });

      logger.debug('Event sent to Kafka', {
        eventId: event.eventId,
        topic: config.kafka.topics.rawEvents,
        sourceId: event.sourceId,
      });
    } catch (error) {
      logger.error('Failed to send event to Kafka', {
        eventId: event.eventId,
        error,
      });
      throw error;
    }
  }

  async sendToDeadLetter(
    rawPayload: unknown,
    error: string,
    sourceIp?: string
  ): Promise<void> {
    if (!this.isConnected) {
      logger.warn('Cannot send to DLQ — producer not connected');
      return;
    }

    try {
      await this.producer.send({
        topic: config.kafka.topics.deadLetter,
        messages: [
          {
            value: JSON.stringify({
              originalPayload: rawPayload,
              error,
              failedAt: new Date().toISOString(),
              sourceIp,
            }),
          },
        ],
      });

      logger.warn('Event sent to dead letter queue', { error });
    } catch (dlqError) {
      logger.error('Failed to send to dead letter queue', { dlqError });
    }
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
    this.isConnected = false;
    logger.info('Kafka producer disconnected');
  }

  getStatus(): boolean {
    return this.isConnected;
  }
}
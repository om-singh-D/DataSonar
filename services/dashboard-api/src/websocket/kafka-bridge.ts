import { ChangeStream } from 'mongodb';

import { config } from '../config';
import { getMongo } from '../db/mongo';
import { logger } from '../utils/logger';

type Broadcaster = (eventType: string, payload: unknown) => void;

let streams: ChangeStream[] = [];
let kafkaDisconnect: (() => Promise<void>) | null = null;

async function startMongoBridge(broadcast: Broadcaster): Promise<void> {
  const db = getMongo();

  const watch = async (collectionName: string, eventType: string): Promise<void> => {
    const stream = db.collection(collectionName).watch([], { fullDocument: 'updateLookup' });
    stream.on('change', (change: any) => {
      if (change.operationType === 'insert') {
        broadcast(eventType, change.fullDocument);
      }
      if (change.operationType === 'update' && eventType === 'new-alert') {
        broadcast('alert-updated', change.fullDocument);
      }
    });
    streams.push(stream);
  };

  await watch('alerts', 'new-alert');
  await watch('anomalies', 'new-anomaly');
  await watch('quality_scores', 'quality-update');
  logger.info('Realtime bridge active in MongoDB change-stream mode');
}

async function startKafkaBridge(broadcast: Broadcaster): Promise<boolean> {
  try {
    const { Kafka } = await import('kafkajs');
    const kafka = new Kafka({ brokers: config.websocketBridge.kafkaBrokers });
    const consumer = kafka.consumer({ groupId: 'dashboard-api-ws-bridge' });

    await consumer.connect();
    await consumer.subscribe({ topic: config.websocketBridge.topics.quality, fromBeginning: false });
    await consumer.subscribe({ topic: config.websocketBridge.topics.anomalies, fromBeginning: false });
    await consumer.subscribe({ topic: config.websocketBridge.topics.alerts, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        const raw = message.value?.toString('utf-8');
        if (!raw) return;
        let payload: unknown;
        try {
          payload = JSON.parse(raw);
        } catch {
          payload = { raw };
        }

        if (topic === config.websocketBridge.topics.alerts) {
          broadcast('new-alert', payload);
        } else if (topic === config.websocketBridge.topics.anomalies) {
          broadcast('new-anomaly', payload);
        } else {
          broadcast('quality-update', payload);
        }
      },
    });

    kafkaDisconnect = async () => {
      await consumer.disconnect();
    };

    logger.info('Realtime bridge active in Kafka mode');
    return true;
  } catch (error) {
    logger.warn('Kafka bridge unavailable, falling back to MongoDB change streams', {
      error: (error as Error).message,
    });
    return false;
  }
}

export async function startRealtimeBridge(broadcast: Broadcaster): Promise<void> {
  if (config.websocketBridge.mode === 'kafka') {
    const started = await startKafkaBridge(broadcast);
    if (started) return;
  }

  try {
    await startMongoBridge(broadcast);
  } catch (error) {
    logger.warn('MongoDB change-stream bridge unavailable (replica set required)', {
      error: (error as Error).message,
    });
  }
}

export async function stopRealtimeBridge(): Promise<void> {
  for (const stream of streams) {
    try {
      await stream.close();
    } catch {
      // no-op
    }
  }
  streams = [];

  if (kafkaDisconnect) {
    await kafkaDisconnect();
    kafkaDisconnect = null;
  }
}

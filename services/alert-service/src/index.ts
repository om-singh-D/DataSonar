import express from 'express';

import { config } from './config';
import { RabbitMQConsumer } from './infra/rabbitmq.consumer';
import { RedisClient } from './infra/redis.client';
import { MessageProcessor } from './processor';
import { EmailProvider } from './providers/email.provider';
import { NotificationProvider } from './providers/provider.interface';
import { SlackProvider } from './providers/slack.provider';
import { WebhookProvider } from './providers/webhook.provider';
import { AlertPayload } from './schemas/alert.schema';
import { DedupService } from './services/dedup.service';

const app = express();
app.use(express.json());

const redisClient = new RedisClient({
  host: config.redisHost,
  port: config.redisPort,
  password: config.redisPassword,
});

const rabbitConsumer = new RabbitMQConsumer({
  url: config.rabbitmqUrl,
  queue: config.rabbitmqQueueAlerts,
  dlq: config.rabbitmqDlq,
  exchange: config.rabbitmqExchange,
  routingKey: config.rabbitmqRoutingKey,
});

const dedupService = new DedupService(redisClient, config.dedupTtlSeconds);

const slackProvider = new SlackProvider(config.slackWebhookUrl);
const emailProvider = new EmailProvider({ smtpConnString: config.smtpConnString });
const webhookProvider = new WebhookProvider(config.webhookUrl);

const providerResolver = (alert: AlertPayload): NotificationProvider[] => {
  if (alert.severity === 'critical' || alert.severity === 'high') {
    return [slackProvider, emailProvider, webhookProvider];
  }
  if (alert.severity === 'medium') {
    return [slackProvider, webhookProvider];
  }
  return [webhookProvider];
};

const processor = new MessageProcessor(dedupService, providerResolver);

app.get('/health', async (_req, res) => {
  const redisHealthy = await redisClient.healthcheck();
  const rabbitHealthy = await rabbitConsumer.isHealthy();

  res.status(redisHealthy && rabbitHealthy ? 200 : 503).json({
    status: redisHealthy && rabbitHealthy ? 'ok' : 'degraded',
    checks: {
      redis: redisHealthy,
      rabbitmq: rabbitHealthy,
    },
  });
});

app.post('/api/v1/alerts/test', async (req, res) => {
  const result = await processor.processRaw(req.body);
  if (result.ok) {
    return res.status(200).json({ ok: true, result });
  }
  return res.status(result.requeue ? 502 : 400).json({ ok: false, result });
});

const start = async (): Promise<void> => {
  await redisClient.connect();
  await rabbitConsumer.connect();

  await rabbitConsumer.consume(async (message, channel) => {
    const raw = message.content.toString('utf-8');
    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      channel.nack(message, false, false);
      return;
    }

    const result = await processor.processRaw(payload);
    if (result.ok) {
      channel.ack(message);
      return;
    }

    channel.nack(message, false, result.requeue);
  });

  app.listen(config.port, () => {
    console.log(`${config.serviceName} listening on ${config.port}`);
  });
};

const shutdown = async (): Promise<void> => {
  await rabbitConsumer.disconnect();
  await redisClient.disconnect();
};

process.on('SIGTERM', () => {
  shutdown().finally(() => process.exit(0));
});
process.on('SIGINT', () => {
  shutdown().finally(() => process.exit(0));
});

start().catch((error) => {
  console.error('Alert-service startup failed', error);
  process.exit(1);
});

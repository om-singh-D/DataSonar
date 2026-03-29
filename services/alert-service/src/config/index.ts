import dotenv from 'dotenv';

dotenv.config();

export type AppConfig = {
  serviceName: string;
  port: number;
  rabbitmqUrl: string;
  rabbitmqExchange: string;
  rabbitmqRoutingKey: string;
  rabbitmqQueueAlerts: string;
  rabbitmqDlq: string;
  redisHost: string;
  redisPort: number;
  redisPassword?: string;
  dedupTtlSeconds: number;
  slackWebhookUrl?: string;
  smtpConnString?: string;
  webhookUrl?: string;
};

const required = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

export const config: AppConfig = {
  serviceName: process.env.SERVICE_NAME ?? 'datasonar-alert-service',
  port: Number(process.env.SERVICE_PORT ?? 8003),
  rabbitmqUrl: required(process.env.RABBITMQ_URL, 'RABBITMQ_URL'),
  rabbitmqExchange: process.env.RABBITMQ_EXCHANGE ?? 'alerts.exchange',
  rabbitmqRoutingKey: process.env.RABBITMQ_ROUTING_KEY ?? 'alert.anomaly.detected',
  rabbitmqQueueAlerts: process.env.RABBITMQ_QUEUE_ALERTS ?? 'alerts.anomaly.queue',
  rabbitmqDlq: process.env.RABBITMQ_DLQ ?? 'alerts.anomaly.dlq',
  redisHost: process.env.REDIS_HOST ?? 'localhost',
  redisPort: Number(process.env.REDIS_PORT ?? 6379),
  redisPassword: process.env.REDIS_PASSWORD,
  dedupTtlSeconds: Number(process.env.DEDUP_TTL_SECONDS ?? 900),
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
  smtpConnString: process.env.SMTP_CONN_STRING,
  webhookUrl: process.env.WEBHOOK_URL,
};

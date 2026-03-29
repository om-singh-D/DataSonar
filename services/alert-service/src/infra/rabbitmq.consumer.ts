import amqp, { Channel, ChannelModel, ConsumeMessage } from 'amqplib';

type MessageHandler = (message: ConsumeMessage, channel: Channel) => Promise<void>;

export class RabbitMQConsumer {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private readonly url: string;
  private readonly queue: string;
  private readonly dlq: string;
  private readonly exchange: string;
  private readonly routingKey: string;
  private readonly reconnectDelayMs: number;
  private isShuttingDown = false;
  private consumeHandler?: MessageHandler;

  constructor(params: {
    url: string;
    queue: string;
    dlq: string;
    exchange: string;
    routingKey: string;
    reconnectDelayMs?: number;
  }) {
    this.url = params.url;
    this.queue = params.queue;
    this.dlq = params.dlq;
    this.exchange = params.exchange;
    this.routingKey = params.routingKey;
    this.reconnectDelayMs = params.reconnectDelayMs ?? 5000;
  }

  async connect(): Promise<void> {
    const connection = await amqp.connect(this.url);
    connection.on('close', () => {
      this.channel = null;
      if (!this.isShuttingDown) {
        this.scheduleReconnect();
      }
    });
    connection.on('error', () => {
      this.channel = null;
    });

    const channel = await connection.createChannel();
    await channel.assertExchange(this.exchange, 'topic', { durable: true });
    await channel.assertQueue(this.dlq, { durable: true });
    await channel.assertQueue(this.queue, {
      durable: true,
      arguments: {
        'x-dead-letter-routing-key': this.dlq,
      },
    });
    await channel.bindQueue(this.queue, this.exchange, this.routingKey);
    await channel.prefetch(20);

    this.connection = connection;
    this.channel = channel;
  }

  async consume(handler: MessageHandler): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    this.consumeHandler = handler;

    await this.channel.consume(this.queue, async (message) => {
      if (!message || !this.channel) {
        return;
      }
      await handler(message, this.channel);
    });
  }

  async disconnect(): Promise<void> {
    this.isShuttingDown = true;

    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }

  async isHealthy(): Promise<boolean> {
    return Boolean(this.connection && this.channel);
  }

  private scheduleReconnect(): void {
    setTimeout(async () => {
      if (this.isShuttingDown) {
        return;
      }
      try {
        await this.connect();
        if (this.consumeHandler) {
          await this.consume(this.consumeHandler);
        }
      } catch {
        this.scheduleReconnect();
      }
    }, this.reconnectDelayMs);
  }
}

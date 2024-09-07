import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Connection, Channel } from 'amqplib';

@Injectable()
export class RabbitMqService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}
  private connection: Connection;
  private channel: Channel;
  private readonly logger = new Logger(RabbitMqService.name);
  private readonly exchangeName = this.configService.get(
    'RABBITMQ_EXCHANGE_NAME',
  );
  // private readonly queueName = `records_web_backend_queue_${uuidv4()}`; FIX_ME now it isn't need

  async onModuleInit() {
    await this.connectToRabbitMQ();
  }

  private async connectToRabbitMQ() {
    try {
      const username = this.configService.get('RABBITMQ_USERNAME')!;
      const password = this.configService.get('RABBITMQ_PASSWORD')!;
      const host = this.configService.get('RABBITMQ_HOST')!;
      const port = this.configService.get('RABBITMQ_PORT')!;

      this.connection = await connect(
        `amqps://${username}:${password}@${host}:${port}`,
      );
      this.connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error:', err);
        this.reconnectToRabbitMQ();
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
        this.reconnectToRabbitMQ();
      });

      await this.connectChannel();

      this.logger.log('Connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
      setTimeout(() => this.connectToRabbitMQ(), 5000); // Retry after 5 seconds
    }
  }

  private async connectChannel() {
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(this.exchangeName, 'fanout', {
      durable: false,
    });
  }

  private reconnectToRabbitMQ() {
    setTimeout(() => this.connectToRabbitMQ(), 5000); // Retry after 5 seconds
  }

  async closeConnection() {
    await this.channel.close();
    await this.connection.close();
  }
  public async sendMessage(options: { routingKey?: string; body: string }) {
    if (!this.channel) {
      this.logger.error('Channel is not initialized');
      throw new InternalServerErrorException('Channel is not initialized');
    }
    const originalFunction = async () => {
      const { routingKey = '', body } = options;
      const res = await this.channel.publish(
        this.configService.get('RABBITMQ_EXCHANGE_NAME')!,
        routingKey,
        Buffer.from(body),
      );
      this.logger.log(
        `Message published to exchange ${this.exchangeName}: ${body}`,
      );
      return res;
    };
    try {
      return await originalFunction();
    } catch {
      try {
        await this.connectChannel();
        return await originalFunction();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        throw new InternalServerErrorException(
          'Error when publish message to rabbitmq',
          error.name,
        );
      }
    }
  }
}

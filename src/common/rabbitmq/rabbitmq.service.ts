import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, ChannelWrapper } from 'amqp-connection-manager';
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/types/AmqpConnectionManager';

@Injectable()
export class RabbitMqService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}
  private connection: IAmqpConnectionManager;
  private channel: ChannelWrapper;
  private readonly logger = new Logger(RabbitMqService.name);
  private readonly exchangeName = this.configService.get(
    'RABBITMQ_EXCHANGE_NAME',
  );
  private readonly options = {
    heartbeatIntervalInSeconds: 60,
    reconnectTimeInSeconds: 5000,
  };
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
        this.options,
      );
      this.connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error:', err);
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
      });

      await this.connectChannel();

      this.logger.log('Connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
    }
  }

  private async connectChannel() {
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(this.exchangeName, 'fanout', {
      durable: false,
    });
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
    try {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new InternalServerErrorException(
        'Error when publish message to rabbitmq',
        error.name,
      );
    }
  }
}

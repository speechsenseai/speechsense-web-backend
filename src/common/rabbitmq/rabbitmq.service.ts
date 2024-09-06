import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Connection, Channel } from 'amqplib';

@Injectable()
export class RabbitMqService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}
  private connection: Connection;
  private channel: Channel;
  private readonly exchangeName = this.configService.get(
    'RABBITMQ_EXCHANGE_NAME',
  );
  // private readonly queueName = `records_web_backend_queue_${uuidv4()}`; FIX_ME now it isn't need

  private async connectChannel() {
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(this.exchangeName, 'fanout', {
      durable: false,
    });
  }
  async onModuleInit() {
    this.connection = await connect({
      protocol: 'amqps',
      hostname: this.configService.get('RABBITMQ_HOST'),
      port: this.configService.get('RABBITMQ_PORT'),
      username: this.configService.get('RABBITMQ_USERNAME'),
      password: this.configService.get('RABBITMQ_PASSWORD'),
    });

    await this.connectChannel();

    // await this.channel.assertQueue(this.queueName, {
    //   durable: false,
    //   autoDelete: true,
    // }); FIX_ME now it isn't need

    // await this.channel.bindQueue(this.queueName, this.exchangeName, ''); FIX_ME now it isn't need
  }

  async closeConnection() {
    await this.channel.close();
    await this.connection.close();
  }
  public async sendMessage(options: { routingKey?: string; body: string }) {
    const originalFunction = async () => {
      const { routingKey = '', body } = options;
      return await this.channel.publish(
        this.configService.get('RABBITMQ_EXCHANGE_NAME')!,
        routingKey,
        Buffer.from(body),
      );
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

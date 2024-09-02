import { Module } from '@nestjs/common';
import { RabbitMqService } from './rabbitmq.service';
import { ConfigModule } from '@nestjs/config';

export const RABBIT_MQ_NAME = 'RABBITMQ_SERVICE';
@Module({
  imports: [ConfigModule],
  providers: [RabbitMqService],
  exports: [RabbitMqService],
})
export class RabbitMqModule {}

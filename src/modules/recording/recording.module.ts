import { Module } from '@nestjs/common';
import { RecordingController } from './recording.controller';
import { RecordingService } from './recording.service';
import { DeviceModule } from '../device/device.module';
import { AwsS3Module } from '@/common/aws-s3/aws-s3.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recording } from './entities/recording.entity';
import { RabbitMqModule } from '@/common/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    DeviceModule,
    AwsS3Module,
    TypeOrmModule.forFeature([Recording]),
    RabbitMqModule,
  ],
  controllers: [RecordingController],
  providers: [RecordingService],
  exports: [RecordingService],
})
export class RecordingModule {}

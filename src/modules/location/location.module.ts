import { forwardRef, Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { AwsS3Module } from '@/common/aws-s3/aws-s3.module';
import { RecordingModule } from '../recording/recording.module';
import { DeviceModule } from '../device/device.module';
import { RabbitMqModule } from '@/common/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    forwardRef(() => RecordingModule),
    TypeOrmModule.forFeature([Location]),
    AwsS3Module,
    forwardRef(() => DeviceModule),
    RabbitMqModule,
  ],
  providers: [LocationService],
  controllers: [LocationController],
  exports: [LocationService],
})
export class LocationModule {}

import { forwardRef, Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { LocationModule } from '../location/location.module';
import { AwsS3Module } from '@/common/aws-s3/aws-s3.module';
import { JwtModule } from '@nestjs/jwt';
import { RecordingModule } from '../recording/recording.module';
import { RabbitMqModule } from '@/common/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device]),
    forwardRef(() => LocationModule),
    forwardRef(() => RecordingModule),
    AwsS3Module,
    JwtModule,
    RabbitMqModule,
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}

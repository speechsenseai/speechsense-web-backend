import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { LocationModule } from '../location/location.module';
import { AwsS3Module } from 'src/common/aws-s3/aws-s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([Device]), LocationModule, AwsS3Module],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}

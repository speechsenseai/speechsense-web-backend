import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { LocationModule } from '../location/location.module';
import { AwsS3Module } from '@/common/aws-s3/aws-s3.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device]),
    LocationModule,
    AwsS3Module,
    JwtModule,
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}

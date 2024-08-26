import { Module } from '@nestjs/common';
import { RecordingController } from './recording.controller';
import { RecordingService } from './recording.service';
import { DeviceModule } from '../device/device.module';
import { AwsS3Module } from 'src/common/aws-s3/aws-s3.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recording } from './entities/recording.entity';

@Module({
  imports: [DeviceModule, AwsS3Module, TypeOrmModule.forFeature([Recording])],
  controllers: [RecordingController],
  providers: [RecordingService],
  exports: [RecordingService],
})
export class RecordingModule {}

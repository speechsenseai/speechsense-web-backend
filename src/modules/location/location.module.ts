import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { AwsS3Module } from 'src/common/aws-s3/aws-s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([Location]), AwsS3Module],
  providers: [LocationService],
  controllers: [LocationController],
  exports: [LocationService],
})
export class LocationModule {}

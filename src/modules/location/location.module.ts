import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';

@Module({
  imports: [],
  providers: [LocationService],
  controllers: [LocationController],
  exports: [LocationService],
})
export class LocationModule {}

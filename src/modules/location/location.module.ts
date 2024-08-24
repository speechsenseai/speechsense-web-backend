import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { UserModule } from '../users/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Location]), UserModule],
  providers: [LocationService],
  controllers: [LocationController],
  exports: [LocationService],
})
export class LocationModule {}

import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { ConfigModule } from '@nestjs/config';
import { RecordingModule } from '../recording/recording.module';

@Module({
  imports: [ConfigModule, RecordingModule],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}

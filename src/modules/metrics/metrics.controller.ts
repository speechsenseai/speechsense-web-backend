import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}
  @Get('numeric')
  getNumericMetrics(
    @Req() req,
    @Query('locationId') locationId: string,
    @Query('deviceId') deviceId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.metricsService.getNumericMetrics({
      user: req.user.user,
      locationId,
      deviceId,
      startDate,
      endDate,
    });
  }

  @Get('insights')
  getInsightMetrics(
    @Req() req,
    @Query('locationId') locationId?: string,
    @Query('deviceId') deviceId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.metricsService.getInsightMetrics({
      user: req.user.user,
      locationId,
      deviceId,
      startDate,
      endDate,
    });
  }
  @Get('processing_status')
  getProcessingStatus(@Req() req) {
    return this.metricsService.getProcessingStatus(req.user.user);
  }

  @Get('/lines/:recordId')
  getRecordingLines(@Param('recordId') recordId: string) {
    return this.metricsService.getRecordingLines(recordId);
  }
}

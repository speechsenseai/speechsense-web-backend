import { Controller, Get, Query, Req } from '@nestjs/common';
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

  @Get('/lines/')
  getRecordingLines(
    @Req() req,
    @Query('locationId') locationId: string,
    @Query('deviceId') deviceId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,

    @Query('use_pagination') use_pagination?: string,
    @Query('offset') offset?: string,
    @Query('n_lines') n_lines?: string,
  ) {
    return this.metricsService.getRecordingLines({
      user: req.user.user,
      locationId,
      deviceId,
      startDate,
      endDate,
      use_pagination,
      offset,
      n_lines,
    });
  }
}

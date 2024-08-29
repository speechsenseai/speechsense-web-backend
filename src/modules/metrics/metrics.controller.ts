import { Controller, Get, Req } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}
  @Get('numeric')
  getNumericMetrics(@Req() req) {
    return this.metricsService.getNumericMetrics(req.user.user);
  }

  @Get('insights')
  getInsightMetrics(@Req() req) {
    return this.metricsService.getInsightMetrics(req.user.user);
  }
}

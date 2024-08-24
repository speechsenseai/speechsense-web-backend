import { Controller, Get, Param, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeviceService } from './device.service';
import { Paginate, PaginateQuery } from 'nestjs-paginate';

@ApiTags('Devices')
@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}
  @Get(':locationId')
  getDevices(
    @Req() req,
    @Paginate() query: PaginateQuery,
    @Param('locationId') locationId: string,
  ) {
    return this.deviceService.getDevices(req.user.sub, locationId, query);
  }
}

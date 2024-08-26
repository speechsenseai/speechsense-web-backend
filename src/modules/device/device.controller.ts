import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeviceService } from './device.service';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { CreateDeviceDto } from './dto/CreateDevice.dto';

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

  @Post(':locationId')
  createDevice(
    @Req() req,
    @Param('locationId') locationId: string,
    @Body() body: CreateDeviceDto,
  ) {
    return this.deviceService.createDevice(req.user.user, locationId, body);
  }
}

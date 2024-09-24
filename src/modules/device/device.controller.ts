import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeviceService } from './device.service';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { CreateDeviceDto } from './dto/CreateDevice.dto';
import { ConnectDeviceDto } from './dto/ConnectDevice.dto';
import { Public } from '@/decorators/public';

@ApiTags('Devices')
@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}
  @Post('connectDevice')
  @Public()
  async connectDevice(@Body() body: ConnectDeviceDto) {
    return this.deviceService.connectDevice(body);
  }

  @Get('one/:deviceId')
  getOneDevice(@Req() req, @Param('deviceId') deviceId: string) {
    return this.deviceService.getOneDevice(req.user.sub, deviceId);
  }
  @Get(':locationId')
  getDevices(
    @Req() req,
    @Paginate() query: PaginateQuery,
    @Param('locationId') locationId: string,
  ) {
    return this.deviceService.getDevicesByLocation(
      req.user.sub,
      locationId,
      query,
    );
  }

  @Put(':deviceId')
  updateDevice(
    @Req() req,
    @Param('deviceId') deviceId: string,
    @Body() body: CreateDeviceDto,
  ) {
    return this.deviceService.updateDevice(req.user.user, deviceId, body);
  }

  @Post(':locationId')
  createDevice(
    @Req() req,
    @Param('locationId') locationId: string,
    @Body() body: CreateDeviceDto,
  ) {
    return this.deviceService.createDevice(req.user.user, locationId, body);
  }

  @Delete(':deviceId')
  deleteDevice(@Req() req, @Param('deviceId') deviceId: string) {
    return this.deviceService.deleteDeviceWithS3(req.user.user, deviceId);
  }
}

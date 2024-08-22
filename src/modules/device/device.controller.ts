import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Devices')
@Controller('device')
export class DeviceController {}

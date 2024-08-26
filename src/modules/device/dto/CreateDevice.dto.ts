import { IsEnum, IsNotEmpty } from 'class-validator';
import { DeviceType } from '../entities/device.entity';

export class CreateDeviceDto {
  @IsNotEmpty({ message: 'Type is required' })
  @IsEnum(DeviceType, { message: 'Invalid type' })
  type: DeviceType;
}

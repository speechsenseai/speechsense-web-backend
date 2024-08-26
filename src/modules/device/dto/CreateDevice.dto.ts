import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DeviceType } from '../entities/device.entity';

export class CreateDeviceDto {
  @IsNotEmpty({ message: 'Type is required' })
  @IsEnum(DeviceType, { message: 'Invalid type' })
  type: DeviceType;

  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;
}

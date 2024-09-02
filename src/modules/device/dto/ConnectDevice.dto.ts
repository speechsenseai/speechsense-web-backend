import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConnectDeviceDto {
  @IsString({ message: 'User Id must be a string' })
  @ApiProperty()
  @IsNotEmpty({ message: 'user id is required' })
  userId: string;

  @IsString({ message: 'Location Id must be a string' })
  @IsNotEmpty({ message: 'Location id is required' })
  @ApiProperty()
  locationId: string;

  @IsString({ message: 'Device Id must be a string' })
  @IsNotEmpty({ message: 'Device id is required' })
  @ApiProperty()
  deviceId: string;
}

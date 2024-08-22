import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleDto {
  @IsNotEmpty({ message: 'Credential is required' })
  @IsString({ message: 'Credential must be a string' })
  @ApiProperty()
  readonly credential: string;
}

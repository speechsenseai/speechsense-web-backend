import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PatchProfileDto {
  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  @ApiProperty()
  readonly country: string;

  @IsOptional()
  @IsString({ message: 'City must be a string' })
  @ApiProperty()
  readonly city: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  readonly phone: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  readonly name: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: 'Surname must be a string' })
  readonly surname: string;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: 'Organiztio Name must be a string' })
  readonly organiztionName: string;
}

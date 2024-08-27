import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email' })
  @ApiProperty()
  readonly email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @ApiProperty()
  readonly password: string;

  @ApiProperty()
  @IsBoolean({ message: 'Remember must be a boolean' })
  @IsNotEmpty({ message: 'Remember is required' })
  readonly remember: boolean;
}

import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email' })
  email: string;
}

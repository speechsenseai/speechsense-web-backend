import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email must be a valid email' })
    readonly email: string;

    @IsNotEmpty({ message: 'Password is required' })
    @IsString({ message: 'Password must be a string' })
    readonly password: string;
}

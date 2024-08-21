import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class SignUpDto {
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty({ message: 'Email is required' })
    readonly email: string;

    @MaxLength(30, { message: 'Password cannot be longer than 30 characters' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    readonly password: string;
}

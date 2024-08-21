import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
    @IsNotEmpty({ message: 'Token is required' })
    @IsString({ message: 'Token must be a string' })
    readonly token: string;
}

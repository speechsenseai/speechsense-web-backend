import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { Public } from 'src/decorators/public';
import { SignInDto } from './dto/signIn.dto';
import { RefreshDto } from './dto/refresh.dto';

@Controller('auth')
@Public()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signUp')
    async signUp(@Body() signUpBody: SignUpDto) {
        return this.authService.signUp(signUpBody);
    }

    @Post('signIn')
    async signIn(@Body() signInBody: SignInDto) {
        return this.authService.signIn(signInBody);
    }

    @Public()
    @Post('refresh')
    async refresh(@Body() body: RefreshDto) {
        return this.authService.refresh(body.refreshToken);
    }
}

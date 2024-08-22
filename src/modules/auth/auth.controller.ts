import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { Public } from 'src/decorators/public';
import { SignInDto } from './dto/signIn.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ApiTags } from '@nestjs/swagger';
import { GoogleDto } from './dto/google.dto';

@ApiTags('auth')
@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signUp')
  async signUp(@Body() signUpBody: SignUpDto) {
    return this.authService.signUp(signUpBody);
  }

  @HttpCode(200)
  @Post('signIn')
  async signIn(@Body() signInBody: SignInDto) {
    return this.authService.signIn(signInBody);
  }

  @Post('google')
  async google(@Body() googleBody: GoogleDto) {
    return this.authService.google(googleBody);
  }

  @HttpCode(200)
  @Public()
  @Post('refresh')
  async refresh(@Body() body: RefreshDto) {
    return this.authService.refresh(body.refreshToken);
  }
}

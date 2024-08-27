import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { Public } from 'src/decorators/public';
import { SignInDto } from './dto/signIn.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ApiTags } from '@nestjs/swagger';
import { GoogleDto } from './dto/google.dto';
import { ChangePasswordDto } from './dto/ChangePassword.dto';
import { ResetPasswordDto } from './dto/ResetPassword.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signUp')
  async signUp(@Body() signUpBody: SignUpDto) {
    return this.authService.signUp(signUpBody);
  }

  @Public()
  @HttpCode(200)
  @Post('signIn')
  async signIn(@Body() signInBody: SignInDto) {
    return this.authService.signIn(signInBody);
  }

  @Public()
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

  @HttpCode(200)
  @Public()
  @Post('resetPassword')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  @HttpCode(200)
  @Public()
  @Post('changePassword')
  async changePassword(@Body() body: ChangePasswordDto) {
    return this.authService.changePassword(body);
  }
}

import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import { VerifyEmailDto } from './dto/verifyEmail.dto';
import { VerificationService } from './verification.service';
import { Public } from 'src/decorators/public';

@ApiTags('verification')
@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}
  @Post('verifyEmail')
  @Public()
  async verifyEmail(@Body() body: VerifyEmailDto) {
    return this.verificationService.verifyEmail(body);
  }
}

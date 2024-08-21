import { Body, Controller, Post } from '@nestjs/common';
import { VerifyEmailDto } from './dto/verifyEmail.dto';
import { VerificationService } from './verification.service';
import { Public } from 'src/decorators/public';

@Controller('verification')
@Public()
export class VerificationController {
    constructor(private readonly verificationService: VerificationService) {}
    @Post('verifyEmail')
    async verifyEmail(@Body() body: VerifyEmailDto) {
        return this.verificationService.verifyEmail(body);
    }
}

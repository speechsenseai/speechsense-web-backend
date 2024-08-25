import { EmailModule } from '../email/email.module';
import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '../users/user.module';

@Module({
  imports: [EmailModule, UserModule],
  providers: [VerificationService, JwtService],
  controllers: [VerificationController],
  exports: [VerificationService],
})
export class VerificationModule {}

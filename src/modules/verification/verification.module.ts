import { EmailModule } from "../email/email.module";
import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '../users/user.module';
import { DeviceModule } from '../device/device.module';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [EmailModule, UserModule, DeviceModule, LocationModule],
  providers: [VerificationService, JwtService],
  controllers: [VerificationController],
  exports: [VerificationService],
})
export class VerificationModule {}

import { JwtAccessStrategy } from './guard/jwtAccess.strategy';
import { JwtAuthGuard } from './guard/auth.guard';
import { JwtStrategy } from './guard/jwt.strategy';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserModule } from '../users/user.module';
import { VerificationModule } from '../verification/verification.module';
import { APP_GUARD } from '@nestjs/core';
import { AwsS3Module } from 'src/common/aws-s3/aws-s3.module';

@Module({
  imports: [
    UserModule,
    VerificationModule,
    AwsS3Module,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.ACCESS_TOKEN_DURATION },
    }),
  ],
  providers: [
    AuthService,
    JwtService,
    JwtStrategy,
    JwtAccessStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}

import { JwtAccessStrategy } from './guard/jwtAccess.strategy';
import { JwtAuthGuard } from './guard/auth.guard';
import { JwtStrategy } from './guard/jwt.strategy';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserModule } from '../users/user.module';
import { APP_GUARD } from '@nestjs/core';
import { VerificationModule } from '../verification/verification.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [
    UserModule,
    ProfileModule,
    VerificationModule,
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

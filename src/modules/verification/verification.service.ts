import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { UserService } from '../users/user.service';
import { VerifyEmailDto } from './dto/verifyEmail.dto';

@Injectable()
export class VerificationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
  ) {}
  public sendVerification(userId: string, email: string) {
    const token = this.jwtService.sign(
      { sub: userId },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.EMAIL_TOKEN_DURATION,
      },
    );
    const url = `${process.env.CLIENT_URL}${process.env.CLIENT_VERIFICATION_ROUTE}?token=${token}`;
    return this.emailService.sendVerificationEmail({ email, url });
  }
  public async sendResetPasswordEmail(
    userId: string,
    email: string,
    name: string,
  ) {
    const token = this.jwtService.sign(
      { sub: userId },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.EMAIL_TOKEN_DURATION,
      },
    );
    const url = `${process.env.CLIENT_URL}${process.env.CLIENT_RESET_PASSWORD_ROUTE}?token=${token}`;
    return this.emailService.sendResetPasswordEmail({ email, url, name });
  }
  public async decodePasswordResetToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      if (typeof payload === 'object' && 'sub' in payload) {
        return payload.sub;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Password reset token expired');
      }
      if (error?.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid token');
      }
      throw error;
    }
  }
  public async verifyEmail(body: VerifyEmailDto) {
    try {
      const payload = this.jwtService.verify(body.token, {
        secret: process.env.JWT_SECRET,
      });
      if (typeof payload === 'object' && 'sub' in payload) {
        const user = await this.userService.activateUser(payload.sub);
        return user;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email verification token expired');
      }
      if (error?.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid token');
      }
      throw error;
    }
  }
}

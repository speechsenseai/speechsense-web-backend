import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { UserService } from '../users/user.service';
import { VerifyEmailDto } from './dto/verifyEmail.dto';
import { DeviceService } from '../device/device.service';
import { LocationService } from '../location/location.service';

@Injectable()
export class VerificationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
    private readonly deviceService: DeviceService,
    private readonly locationService: LocationService,
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
  public async verifyEmail(body: VerifyEmailDto) {
    try {
      const payload = this.jwtService.verify(body.token, {
        secret: process.env.JWT_SECRET,
      });
      if (typeof payload === 'object' && 'sub' in payload) {
        const user = await this.userService.activateUser(payload.sub);
        if (!user.locations) {
          const device = await this.deviceService.createDefaultDevice();
          const location =
            await this.locationService.createDefaultLocation(device);

          user.locations = [location];
        }
        await this.userService.save(user);
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

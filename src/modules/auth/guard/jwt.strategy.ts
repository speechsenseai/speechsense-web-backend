import { UserService } from '../../users/user.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import 'dotenv/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload) {
    const user = await this.usersService.findUserById(payload.sub);

    if (user?.isVerified === false) {
      throw new UnauthorizedException('User not verified');
    }
    if (!user || user.isDeleted === true) {
      throw new UnauthorizedException('User not found');
    }
    return payload;
  }
}

import { UserService } from '../../users/user.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
    if (payload.isDevice || !payload.sub) {
      throw new ForbiddenException();
    }
    const user = await this.usersService.findUserById({
      id: payload.sub,
      serialize: false,
    });

    if (!user || user.isDeleted) {
      throw new UnauthorizedException('User not found');
    }
    if (!user?.isVerified) {
      throw new UnauthorizedException('User not verified');
    }

    return { ...payload, user };
  }
}

import { UserService } from '../../users/user.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import 'dotenv/config';

@Injectable()
export class DeviceStrategy extends PassportStrategy(Strategy, 'device-jwt') {
  constructor(private usersService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_DEVICE_SECRET,
    });
  }

  async validate(payload) {
    try {
      const user = await this.usersService.findUserById({
        id: payload.uId,
        where: {
          locations: {
            id: payload.lId,
            devices: {
              id: payload.dId,
            },
          },
        },
        relations: {
          locations: {
            devices: true,
          },
        },
      });
      if (
        !user ||
        !user?.id ||
        !user?.locations?.[0]?.id ||
        !user?.locations?.[0]?.devices?.[0]?.id
      ) {
        throw new UnauthorizedException('Invalid token');
      }
      const device = {
        user: user,
        location: user.locations[0],
        device: user.locations[0].devices[0],
      };

      return { ...payload, device };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }
}

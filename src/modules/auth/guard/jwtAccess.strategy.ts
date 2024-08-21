import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import 'dotenv/config';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    const token =
      typeof req?.headers['Authorization'] === 'string'
        ? req?.headers['Authorization']
        : (req?.headers['Authorization']?.[0] ?? '');
    const accessToken = token.replace('Bearer ', '').trim();

    return { ...payload, accessToken: accessToken };
  }
}

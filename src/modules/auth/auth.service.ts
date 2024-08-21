import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { UserService } from '../users/user.service';
import { hash, compare } from 'bcrypt';
import { VerificationService } from '../verification/verification.service';
import { JwtService } from '@nestjs/jwt';
import { LoginType } from '../users/entities/user.entity';
import { SignInDto } from './dto/signIn.dto';
import 'dotenv/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly verificationService: VerificationService,
    private readonly jwtService: JwtService,
  ) {}
  public async signUp(body: SignUpDto) {
    const isExist = await this.userService.findUserByEmail(body.email);
    if (isExist) {
      throw new ConflictException('User with this email already exists');
    }

    const hashPassword = await this.hashString(body.password);

    const user = await this.userService.createUser({
      ...body,
      password: hashPassword,
      loginType: LoginType.EMAIL,
    });
    await this.verificationService.sendVerification(user.id, body.email);
    const tokens = await this.getTokens({
      userId: user.id,
      email: user.email,
    });

    return { message: 'Succefully registered', tokens };
  }
  public async signIn(body: SignInDto) {
    const user = await this.userService.findUserByEmail(body.email);
    if (!user) {
      throw new BadRequestException('User with this email not found');
    }

    const isPasswordMatch = await compare(body.password, user.password);
    if (!isPasswordMatch) {
      throw new BadRequestException('Password is incorrect');
    }
    if (user.isVerified === false) {
      throw new BadRequestException('User not verified');
    }
    const tokens = await this.getTokens({
      userId: user.id,
      email: user.email,
    });

    return { message: 'Succefully signed in', tokens };
  }

  public async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      if (
        typeof payload === 'object' &&
        'sub' in payload &&
        'email' in payload
      ) {
        const user = await this.userService.findUserById(payload.sub);
        if (!user) {
          throw new BadRequestException('User not found');
        }

        const tokens = await this.getTokens({
          userId: payload.sub,
          email: payload.email,
        });

        return { message: 'Refreshed succefully', tokens };
      }
      return new BadRequestException('Bad refresh token');
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email verification token expired');
      }
      if (error?.name === 'JsonWebTokenError') {
        throw new BadRequestException('Bad verification token');
      }
      throw error;
    }
  }

  private async hashString(string: string): Promise<string> {
    return await hash(string, Number(process.env.SALT_ROUNDS));
  }

  async getTokens({ userId, email }: { userId: string; email: string }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email: email,
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.ACCESS_TOKEN_DURATION,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email: email,
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.REFRESH_TOKEN_DURATION,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}

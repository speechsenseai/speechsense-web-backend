import { GoogleClient } from '../../common/lib/google';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { UserService } from '../users/user.service';
import { hash, compare } from 'bcrypt';
import { VerificationService } from '../verification/verification.service';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/signIn.dto';
import 'dotenv/config';
import { GoogleDto } from './dto/google.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly verificationService: VerificationService,
    private readonly jwtService: JwtService,
  ) {}
  public async signUp(body: SignUpDto) {
    const isExist = await this.userService.findUserByEmail({
      email: body.email,
    });

    if (isExist) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashPassword = await this.hashString(body.password);

    const user = await this.userService.createUser({
      ...body,
      password: hashPassword,
      isEmail: true,
    });
    await this.userService.createDefaultLocationDevice(user);
    try {
      await this.verificationService.sendVerification(user.id, body.email);
    } catch {
      await this.userService.deleteUser(user.id);
      return new InternalServerErrorException('Error sending email');
    }
    const tokens = await this.getTokens({
      userId: user.id,
      email: user.email,
    });

    return { message: 'Succefully registered', tokens };
  }

  public async signIn(body: SignInDto) {
    const user = (await this.userService.findUserByEmail({
      email: body.email,
      serialize: false,
    })) as User | null;
    if (!user || !user.password) {
      throw new BadRequestException('User with this email not found');
    }

    const isPasswordMatch = await compare(body.password, user.password);
    if (!isPasswordMatch) {
      throw new BadRequestException('Password is incorrect');
    }
    if (!user.isVerified) {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email verification token expired');
      }
      if (error?.name === 'JsonWebTokenError') {
        throw new BadRequestException('Bad verification token');
      }
      throw error;
    }
  }

  public async google(body: GoogleDto) {
    const ticket = await GoogleClient.verifyIdToken({
      idToken: body.credential,
    });
    const payload = ticket.getPayload();
    if (!payload?.name) {
      return new BadRequestException('Bad credential');
    }
    const user = await this.userService.findUserByEmail({
      email: payload.email!,
    });

    if (!user) {
      const googleNewUser = await this.userService.createUser({
        name: payload.given_name,
        email: payload.email,
        isGoogle: true,
        isVerified: true,
      });
      const tokens = await this.getTokens({
        userId: googleNewUser.id,
        email: googleNewUser.email,
      });
      return { message: 'Successfully signed in', tokens };
    } else {
      await this.userService.update(user.id, {
        isVerified: true,
        isGoogle: true,
      });
      const tokens = await this.getTokens({
        userId: user.id,
        email: user.email,
      });
      return { message: 'Successfully signed in', tokens };
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

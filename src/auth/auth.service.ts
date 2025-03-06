import {
  Injectable,
  InternalServerErrorException,
  Response,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { Response as ExpressResponse } from 'express';

import { User } from 'src/user/schemas/user.schema';

import { UserService } from '../user/user.service';
import { ProfileDto } from './dto/profile.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findOne(email);

    if (user && (await bcrypt.compare(password, user.password)) && user.emailVerified) {
      return user;
    }

    throw new UnauthorizedException('Authentication failed. Please check your credentials.');
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<{ message: string }> {
    await this.userService.create(email, password, firstName, lastName);

    return {
      message: 'If this email is not registered, you will receive a verification email shortly.',
    };
  }

  async verifyEmail(email: string, code: string, @Response() res: ExpressResponse): Promise<void> {
    const user = await this.userService.verifyEmail(email, code);

    const payload: JwtPayload = { sub: user._id.toString() };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '10m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '30d',
    });

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({ message: 'Email verified successfully' });
  }

  login(user: User, @Response() res: ExpressResponse): void {
    const payload: JwtPayload = { sub: user._id.toString() };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '10m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '30d',
    });

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({ message: 'Logged in successfully' });
  }

  async refreshToken(refreshToken: string, @Response() res: ExpressResponse): Promise<void> {
    try {
      const decoded: JwtPayload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userService.findOneById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('Authentication failed. Please check your credentials.');
      }

      const newAccessToken = this.jwtService.sign(
        { email: user.email, sub: user._id.toString() },
        { secret: this.configService.get<string>('JWT_SECRET'), expiresIn: '10m' },
      );

      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 10 * 60 * 1000, // 10 minutes
      });

      res.json({ message: 'Token refreshed successfully' });
    } catch {
      throw new UnauthorizedException('Authentication failed. Please check your credentials.');
    }
  }

  async getProfile(accessToken: string): Promise<ProfileDto> {
    try {
      const decoded: JwtPayload = this.jwtService.verify(accessToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.userService.findOneById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('Authentication failed. Please check your credentials.');
      }

      const safeUser = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles: user.roles,
        emailVerified: user.emailVerified,
      };

      return safeUser;
    } catch {
      throw new InternalServerErrorException();
    }
  }
}

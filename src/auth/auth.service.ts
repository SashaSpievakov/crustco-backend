import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';

import { User } from 'src/user/schemas/user.schema';

import { UserService } from '../user/user.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findOne(email);

    if (user && (await bcrypt.compare(password, user.password)) && user.emailVerified) {
      return user;
    }

    throw new UnauthorizedException('Authentication failed. Please check your credentials.');
  }

  async register(email: string, password: string): Promise<{ message: string }> {
    await this.userService.create(email, password);

    return {
      message: 'If this email is not registered, you will receive a verification email shortly.',
    };
  }

  async verifyEmail(
    email: string,
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userService.verifyEmail(email, code);

    const payload: JwtPayload = { email: user.email, sub: user._id.toString() };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '5m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  login(user: User) {
    const payload: JwtPayload = { email: user.email, sub: user._id.toString() };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '5m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded: JwtPayload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || '',
      });

      const user = await this.userService.findOne(decoded.email);
      if (!user) {
        throw new Error();
      }

      const newAccessToken = this.jwtService.sign(
        { email: user.email, sub: user._id.toString() },
        { secret: process.env.JWT_SECRET, expiresIn: '5m' },
      );

      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Authentication failed. Please check your credentials.');
    }
  }
}

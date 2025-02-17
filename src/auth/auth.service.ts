import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
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
    throw new UnauthorizedException('Invalid credentials or email not verified');
  }

  async register(email: string, password: string): Promise<{ message: string }> {
    const existingUser = await this.userService.findOne(email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    await this.userService.create(email, hashedPassword);

    return {
      message: 'Registration successful, please check your email for the verification code.',
    };
  }

  async verifyEmail(
    email: string,
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userService.verifyEmail(email, code);
    if (!user) {
      throw new UnauthorizedException('Invalid verification code');
    }

    const payload: JwtPayload = { email: user.email, sub: user._id.toString() };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '5m', // Access token expires in 5 minutes
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '30d', // Refresh token expires in 30 days
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
      expiresIn: '5m', // Access token expires in 1 hour
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET, // Define a separate secret for refresh tokens
      expiresIn: '30d', // Refresh token expires in 7 days
    });

    // You can store the refresh token in a database or return it to the user
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
        throw new Error('User not found');
      }

      // Generate new access token using the same payload
      const newAccessToken = this.jwtService.sign(
        { email: user.email, sub: user._id.toString() },
        { secret: process.env.JWT_SECRET, expiresIn: '5m' },
      );

      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException();
    }
  }
}

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Response,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Response as ExpressResponse } from 'express';
import { Model, Types } from 'mongoose';

import { AuthProvider, ProviderUser } from 'src/common/types/provider-user.type';
import { User } from 'src/user/schemas/user.schema';

import { UserService } from '../user/user.service';
import { ProfileDto } from './dto/profile.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Token, TokenDocument } from './schemas/token.schema';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(Token.name) private readonly tokenModel: Model<TokenDocument>,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findOne(email);

    if (
      user &&
      user.password &&
      (await bcrypt.compare(password, user.password)) &&
      user.emailVerified
    ) {
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
    await this.userService.register(email, password, firstName, lastName);

    return {
      message: 'If this email is not registered, you will receive a verification email shortly.',
    };
  }

  async verifyEmail(
    email: string,
    code: string,
    userAgent: string,
    ipAddress: string | undefined,
    @Response() res: ExpressResponse,
  ): Promise<void> {
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

    await this.storeRefreshToken(
      user._id,
      refreshToken,
      userAgent,
      ipAddress,
      30 * 24 * 60 * 60 * 1000,
    );

    res.json({ message: 'Email verified successfully.' });
  }

  async login(
    user: User,
    userAgent: string,
    ipAddress: string | undefined,
    @Response() res: ExpressResponse,
  ): Promise<void> {
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

    await this.storeRefreshToken(
      user._id,
      refreshToken,
      userAgent,
      ipAddress,
      30 * 24 * 60 * 60 * 1000,
    );

    res.json({ message: 'Logged in successfully.' });
  }

  async loginWithProvider(
    providerUser: ProviderUser,
    providerType: AuthProvider,
    userAgent: string,
    ipAddress: string | undefined,
    @Response() res: ExpressResponse,
  ): Promise<void> {
    let existingUser = await this.userService.findOne(providerUser.email);

    if (!existingUser) {
      const newUser = await this.userService.registerWithProvider(providerUser);
      if (newUser) existingUser = newUser;
    }

    if (existingUser && existingUser.provider === providerType) {
      const payload: JwtPayload = { sub: existingUser._id.toString() };

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

      await this.storeRefreshToken(
        existingUser._id,
        refreshToken,
        userAgent,
        ipAddress,
        30 * 24 * 60 * 60 * 1000,
      );

      res.json({ message: `Authorized successfully with ${existingUser.provider}.` });
    } else {
      throw new UnauthorizedException('Authentication failed. Please check your credentials.');
    }
  }

  async refreshToken(
    refreshToken: string,
    userAgent: string,
    @Response() res: ExpressResponse,
  ): Promise<void> {
    try {
      const decoded: JwtPayload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userService.findOneById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('Authentication failed. Please check your credentials.');
      }

      const validToken = await this.validateRefreshToken(decoded.sub, userAgent, refreshToken);
      if (!validToken) {
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

      res.json({ message: 'Token refreshed successfully.' });
    } catch {
      throw new UnauthorizedException('Authentication failed. Please check your credentials.');
    }
  }

  async getProfile(userId: string): Promise<ProfileDto> {
    try {
      const user = await this.userService.findOneById(userId);
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

  async resetPassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    await this.userService.updatePassword(userId, oldPassword, newPassword);
    return;
  }

  async forgotPassword(email: string, code?: string, password?: string): Promise<void | User> {
    if (code || password) {
      if (code && password) {
        return await this.userService.createNewPassword(email, code, password);
      } else {
        throw new BadRequestException('Provide valid code and password');
      }
    } else {
      await this.userService.initializeForgotPassword(email);
      return;
    }
  }

  async logout(
    logoutAll: boolean,
    refreshToken: string | undefined,
    userAgent: string,
    @Response() res: ExpressResponse,
  ): Promise<void> {
    if (refreshToken) {
      const decoded: JwtPayload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      if (logoutAll) {
        await this.tokenModel.deleteMany({
          userId: new Types.ObjectId(decoded.sub),
        });
      } else {
        const hashedToken = this.hashToken(refreshToken);
        await this.tokenModel.deleteOne({
          userId: new Types.ObjectId(decoded.sub),
          refreshToken: hashedToken,
          userAgent,
        });
      }
    }

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    res.json({ message: 'Successfully logged out.' });
  }

  private hashToken(token: string): string {
    return crypto
      .createHmac('sha256', this.configService.get<string>('TOKEN_HASH') || '')
      .update(token)
      .digest('hex');
  }

  private compareToken(token: string, hash: string): boolean {
    return this.hashToken(token) === hash;
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
    userAgent: string,
    ipAddress: string | undefined,
    expiresIn: number,
  ): Promise<Token | void> {
    const existingToken = await this.tokenModel.findOne({ userId, userAgent }).exec();
    const hashedToken = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + expiresIn);

    if (existingToken) {
      existingToken.ipAddress = ipAddress || '';
      existingToken.refreshToken = hashedToken;
      existingToken.expiresAt = expiresAt;

      return existingToken.save();
    } else {
      const newToken = new this.tokenModel({
        userId,
        refreshToken: hashedToken,
        userAgent,
        ipAddress,
        expiresAt,
      });

      return newToken.save();
    }
  }

  private async validateRefreshToken(
    userId: string,
    userAgent: string,
    refreshToken: string,
  ): Promise<boolean> {
    const storedToken = await this.tokenModel
      .findOne({ userId: new Types.ObjectId(userId), userAgent })
      .sort({ createdAt: -1 });

    if (!storedToken) return false;
    return this.compareToken(refreshToken, storedToken.refreshToken);
  }
}

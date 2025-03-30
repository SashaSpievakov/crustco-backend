import {
  BadRequestException,
  ConflictException,
  HttpStatus,
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
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';

import { AuthProvider, ProviderUser } from 'src/common/types/provider-user.type';
import { TwoFactorMethod } from 'src/common/types/twoFactorMethod.type';
import { UserDto } from 'src/user/dto/user.dto';
import { User } from 'src/user/schemas/user.schema';

import { UserService } from '../user/user.service';
import { ProfileUpdateDto } from './dto/profile-update-input.dto';
import { TotpGenerateSuccessDto } from './dto/totp-generate-success.dto';
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
    const user = await this.userService.findOne(email, []);

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

  async login(
    user: User,
    userAgent: string,
    ipAddress: string | undefined,
    @Response() res: ExpressResponse,
    successMessage: string = 'Logged in successfully.',
  ): Promise<void> {
    const payload: JwtPayload = { sub: user._id.toString() };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXP_TIME'),
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

    res.json({ message: successMessage });
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

    await this.login(user, userAgent, ipAddress, res, 'Email verified successfully.');
  }

  async verifyEmail2FA(email: string, code: string): Promise<User> {
    const user = await this.userService.verifyEmail2FA(email, code);
    return user;
  }

  async verifyTotp2FA(email: string, token: string): Promise<User> {
    const user = await this.userService.findOne(email, []);

    if (!user || !user.totpEnabled || !user.totpSecret || !user.totp2FAStarted) {
      throw new BadRequestException('Invalid or expired totp token');
    }

    const decryptedSecret = this.decryptSecret(user.totpSecret);
    const totpValidated = authenticator.verify({
      token: token,
      secret: decryptedSecret,
    });
    if (!totpValidated) {
      throw new BadRequestException('Invalid or expired totp token');
    }

    user.totp2FAStarted = false;
    return await user.save();
  }

  async loginWithProvider(
    providerUser: ProviderUser,
    providerType: AuthProvider,
    userAgent: string,
    ipAddress: string | undefined,
    @Response() res: ExpressResponse,
  ): Promise<void> {
    let existingUser = await this.userService.findOne(providerUser.email, []);

    if (!existingUser) {
      const newUser = await this.userService.registerWithProvider(providerUser);
      if (newUser) existingUser = newUser;
    }

    if (existingUser && existingUser.provider === providerType) {
      if (existingUser.twoFactorMethod) {
        await this.request2FA(existingUser._id, existingUser.twoFactorMethod);

        res.status(HttpStatus.ACCEPTED).json({
          message: 'Two-factor authentication required.',
          method: existingUser.twoFactorMethod,
        });
        return;
      }

      await this.login(
        existingUser,
        userAgent,
        ipAddress,
        res,
        `Authorized successfully with ${existingUser.provider}.`,
      );
    } else {
      throw new UnauthorizedException('Authentication failed. Please check your credentials.');
    }
  }

  async generateTotp(userId: string): Promise<TotpGenerateSuccessDto> {
    const user = await this.userService.findOneById(userId, []);
    if (!user) {
      throw new InternalServerErrorException();
    }

    const secret = authenticator.generateSecret();
    const otpAuthUrl = authenticator.keyuri(user.email, 'Crustco', secret);
    const qrCodeUrl = await qrcode.toDataURL(otpAuthUrl);

    return { qrCodeUrl, secret };
  }

  async enableTotpVerification(userId: string, token: string, secret: string): Promise<void> {
    const user = await this.userService.findOneById(userId, []);
    if (!user) {
      throw new InternalServerErrorException();
    }
    if (user.totpEnabled) {
      throw new ConflictException('TOTP authentication is already enabled.');
    }

    const totpValidated = authenticator.verify({ token, secret });
    if (!totpValidated) {
      throw new BadRequestException('Invalid or expired totp token');
    }

    const encryptedSecret = this.encryptSecret(secret);
    user.twoFactorMethod = 'totp';
    user.totpSecret = encryptedSecret;
    user.totpEnabled = true;
    await user.save();
    return;
  }

  async disableTotpVerification(userId: string, token: string): Promise<void> {
    const user = await this.userService.findOneById(userId, []);
    if (!user) {
      throw new InternalServerErrorException();
    }
    if (!user.totpEnabled || !user.totpSecret) {
      throw new ConflictException('TOTP is not enabled for this user.');
    }

    const decryptedSecret = this.decryptSecret(user.totpSecret);
    const totpValidated = authenticator.verify({ token, secret: decryptedSecret });
    if (!totpValidated) {
      throw new BadRequestException('Invalid or expired totp token');
    }

    user.twoFactorMethod = null;
    user.totpSecret = null;
    user.totpEnabled = false;
    await user.save();
    return;
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

      const user = await this.userService.findOneById(decoded.sub, []);
      if (!user) {
        throw new UnauthorizedException('Authentication failed. Please check your credentials.');
      }

      const validToken = await this.validateRefreshToken(decoded.sub, userAgent, refreshToken);
      if (!validToken) {
        throw new UnauthorizedException('Authentication failed. Please check your credentials.');
      }

      const newAccessToken = this.jwtService.sign(
        { email: user.email, sub: user._id.toString() },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXP_TIME'),
        },
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

  async getProfile(
    userId: string,
  ): Promise<Omit<UserDto, 'verificationCode' | 'verificationCodeExpiresAt' | 'totp2FAStarted'>> {
    const user = await this.userService.findOneById(userId, [
      'password',
      'verificationCode',
      'verificationCodeExpiresAt',
      'totpSecret',
      'totp2FAStarted',
    ]);

    if (!user) {
      throw new UnauthorizedException('Authentication failed. Please check your credentials.');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    updatedInfo: ProfileUpdateDto,
  ): Promise<Omit<UserDto, 'verificationCode' | 'verificationCodeExpiresAt' | 'totp2FAStarted'>> {
    const user = await this.userService.findOneById(userId, []);
    const { firstName, lastName, twoFactorMethod } = updatedInfo;

    if (user?.totpEnabled && twoFactorMethod !== undefined) {
      throw new BadRequestException('Cannot update 2fa method when totp is enabled.');
    }

    const updatedUser = await this.userService.update(userId, {
      firstName,
      lastName,
      twoFactorMethod,
    });

    if (!updatedUser) {
      throw new UnauthorizedException('Authentication failed. Please check your credentials.');
    }

    const safeUser = {
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      roles: updatedUser.roles,
      emailVerified: updatedUser.emailVerified,
      provider: updatedUser.provider,
      twoFactorMethod: updatedUser.twoFactorMethod,
      totpEnabled: updatedUser.totpEnabled,
      photo: updatedUser.photo,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    return safeUser;
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

  async request2FA(userId: string, method: TwoFactorMethod): Promise<void> {
    if (method === 'email') {
      await this.userService.initialize2FA(userId);
    } else if (method === 'totp') {
      await this.userService.update(userId, {
        totp2FAStarted: true,
      });
    }
    return;
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

  private encryptSecret(secret: string): string {
    const key = Buffer.from(this.configService.get<string>('TOTP_SECRET_KEY') || '', 'hex');
    if (key.length !== 32) {
      throw new Error('The encryption key must be 32 bytes long.');
    }

    const iv = Buffer.from('1234567890123456');
    const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private decryptSecret(encryptedSecret: string): string {
    const key = Buffer.from(this.configService.get<string>('TOTP_SECRET_KEY') || '', 'hex');
    if (key.length !== 32) {
      throw new Error('The encryption key must be 32 bytes long.');
    }

    const iv = Buffer.from('1234567890123456');
    const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);

    let decrypted = decipher.update(encryptedSecret, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
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

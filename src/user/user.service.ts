import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/smtp-transport';

import { ProviderUser } from 'src/common/types/provider-user.type';

import { getVerificationEmailTemplate } from './emails/email-verification.template';
import { getForgotPasswordTemplate } from './emails/forgot-password.template';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findOne(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOneById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<User | void> {
    const existingUser = await this.findOne(email);

    const verificationCode = crypto.randomBytes(3).toString('hex');
    const verificationCodeExpiresAt = new Date();
    verificationCodeExpiresAt.setMinutes(verificationCodeExpiresAt.getMinutes() + 10);

    const { text, html } = getVerificationEmailTemplate(firstName, verificationCode);
    const mailOptions = {
      from: `"Crustco Support" <${this.configService.get<string>('EMAIL_USER')}>`,
      to: email,
      subject: 'Verify Your Email Address - Crustco',
      text,
      html,
    };

    const hashedPassword = await bcrypt.hash(password, 12);

    if (existingUser) {
      if (!existingUser.emailVerified) {
        existingUser.password = hashedPassword;
        existingUser.verificationCode = verificationCode;
        existingUser.verificationCodeExpiresAt = verificationCodeExpiresAt;
        existingUser.firstName = firstName;
        existingUser.lastName = lastName;

        await this.sendVerificationEmail(email, verificationCode, mailOptions);

        return existingUser.save();
      }
    } else {
      const newUser = new this.userModel({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        roles: ['User'],
        emailVerified: false,
        verificationCode,
        verificationCodeExpiresAt,
      });

      await this.sendVerificationEmail(email, verificationCode, mailOptions);

      return newUser.save();
    }
  }

  async registerWithProvider(providerUser: ProviderUser): Promise<UserDocument | void> {
    const existingUser = await this.findOne(providerUser.email);

    if (!existingUser) {
      const newUser = new this.userModel({
        email: providerUser.email,
        firstName: providerUser.firstName,
        lastName: providerUser.lastName,
        roles: ['User'],
        emailVerified: true,
        provider: providerUser.provider,
        photo: providerUser.photo,
      });

      return newUser.save();
    }
  }

  async verifyEmail(email: string, code: string): Promise<User> {
    const user = await this.findOne(email);
    const currentTime = new Date();

    if (
      !user ||
      user.verificationCode !== code ||
      user.emailVerified ||
      (user.verificationCodeExpiresAt && currentTime > user.verificationCodeExpiresAt)
    ) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    user.emailVerified = true;
    user.verificationCode = '';
    user.verificationCodeExpiresAt = null;
    await user.save();

    return user;
  }

  async updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.findOneById(userId);

    if (!user || !user.password || !(await bcrypt.compare(oldPassword, user.password))) {
      throw new BadRequestException('Invalid old password');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedNewPassword;
    await user.save();
    return;
  }

  async initializeForgotPassword(email: string): Promise<void> {
    const user = await this.findOne(email);
    if (user && user.provider === null) {
      const verificationCode = crypto.randomBytes(3).toString('hex');
      const verificationCodeExpiresAt = new Date();
      verificationCodeExpiresAt.setMinutes(verificationCodeExpiresAt.getMinutes() + 10);

      const { text, html } = getForgotPasswordTemplate(user.firstName, verificationCode);
      const mailOptions = {
        from: `"Crustco Support" <${this.configService.get<string>('EMAIL_USER')}>`,
        to: email,
        subject: 'Reset Your Password - Crustco',
        text,
        html,
      };

      user.verificationCode = verificationCode;
      user.verificationCodeExpiresAt = verificationCodeExpiresAt;

      await this.sendVerificationEmail(email, verificationCode, mailOptions);

      await user.save();
      return;
    }
  }

  async createNewPassword(email: string, code: string, password: string): Promise<User> {
    const user = await this.findOne(email);
    const currentTime = new Date();

    if (
      !user ||
      user.verificationCode !== code ||
      (user.verificationCodeExpiresAt && currentTime > user.verificationCodeExpiresAt)
    ) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.verificationCode = '';
    user.verificationCodeExpiresAt = null;
    user.password = hashedPassword;

    return user.save();
  }

  private async sendVerificationEmail(
    email: string,
    verificationCode: string,
    options: MailOptions,
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });

    try {
      await transporter.sendMail(options);
      Logger.log(`Verification email sent to ${email}, ${verificationCode}`, 'UserService');
    } catch (error) {
      Logger.log(`Error sending verification email to ${email}:`, error, 'UserService');
      throw new InternalServerErrorException();
    }
  }
}

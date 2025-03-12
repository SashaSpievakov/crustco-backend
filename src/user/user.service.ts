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

import { getVerificationEmailTemplate } from './emails/email-verification.template';
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

  async create(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<User | void> {
    const existingUser = await this.findOne(email);

    const verificationCode = crypto.randomBytes(3).toString('hex');
    const verificationCodeExpiresAt = new Date();
    verificationCodeExpiresAt.setMinutes(verificationCodeExpiresAt.getMinutes() + 10);

    const hashedPassword = await bcrypt.hash(password, 12);

    if (existingUser) {
      if (!existingUser.emailVerified) {
        existingUser.password = hashedPassword;
        existingUser.verificationCode = verificationCode;
        existingUser.verificationCodeExpiresAt = verificationCodeExpiresAt;
        existingUser.firstName = firstName;
        existingUser.lastName = lastName;

        await this.sendVerificationEmail(email, verificationCode);

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

      await this.sendVerificationEmail(email, verificationCode);

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

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      throw new BadRequestException('Invalid old password');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedNewPassword;
    await user.save();
    return;
  }

  private async sendVerificationEmail(email: string, verificationCode: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });

    const { text, html } = getVerificationEmailTemplate(verificationCode);
    const mailOptions = {
      from: `"Crustco Support" <${this.configService.get<string>('EMAIL_USER')}>`,
      to: email,
      subject: 'Verify Your Email Address - Crustco',
      text,
      html,
    };

    try {
      await transporter.sendMail(mailOptions);
      Logger.log(`Verification email sent to ${email}, ${verificationCode}`, 'UserService');
    } catch (error) {
      Logger.log(`Error sending verification email to ${email}:`, error, 'UserService');
      throw new InternalServerErrorException();
    }
  }
}

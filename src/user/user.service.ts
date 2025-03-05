import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Model } from 'mongoose';

import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async findOne(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOneById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async create(email: string, password: string): Promise<User | void> {
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

        this.sendVerificationEmail(email, verificationCode);

        return existingUser.save();
      }
    } else {
      const newUser = new this.userModel({
        email,
        password: hashedPassword,
        roles: ['user'],
        emailVerified: false,
        verificationCode,
        verificationCodeExpiresAt,
      });

      this.sendVerificationEmail(email, verificationCode);

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

  private sendVerificationEmail(email: string, verificationCode: string): void {
    // Implement the logic for sending the verification email.
    // You can use Nodemailer, SendGrid, SES, etc.
    console.log(`Sending verification email to ${email} with code: ${verificationCode}`);
  }
}

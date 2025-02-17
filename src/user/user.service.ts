import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Model } from 'mongoose';

import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async findOne(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async create(email: string, password: string): Promise<User> {
    const verificationCode = crypto.randomBytes(3).toString('hex'); // Generate a 6-character verification code
    const verificationCodeExpiresAt = new Date();
    verificationCodeExpiresAt.setMinutes(verificationCodeExpiresAt.getMinutes() + 5);

    const newUser = new this.userModel({
      email,
      password,
      role: ['user'],
      emailVerified: false,
      verified: false,
      verificationCode,
      verificationCodeExpiresAt,
    });

    // Send verification email here (you'll need to implement this)
    this.sendVerificationEmail(email, verificationCode);

    return newUser.save();
  }

  async verifyEmail(email: string, code: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.verificationCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    const currentTime = new Date();
    console.log(currentTime, user.verificationCodeExpiresAt);
    if (user.verificationCodeExpiresAt && currentTime > user.verificationCodeExpiresAt) {
      throw new BadRequestException('Verification code has expired');
    }

    user.emailVerified = true;
    user.verificationCode = ''; // Clear verification code after success
    user.verificationCodeExpiresAt = null; // Clear the expiration date
    await user.save();

    return user;
  }

  private sendVerificationEmail(email: string, verificationCode: string) {
    // Implement the logic for sending the verification email.
    // You can use Nodemailer, SendGrid, SES, etc.
    console.log(`Sending verification email to ${email} with code: ${verificationCode}`);
    // Here, you'll send an email to the user with the verification code.
  }
}

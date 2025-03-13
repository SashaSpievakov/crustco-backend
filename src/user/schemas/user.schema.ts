import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Role } from 'src/common/types/role.type';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: String, required: false, default: null })
  password: string | null;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, type: [String], enum: ['User', 'Admin'] })
  roles: Role[];

  @Prop({ required: true, default: false })
  emailVerified: boolean;

  @Prop({ required: false, default: null })
  verificationCode: string;

  @Prop({ required: false, type: Date, default: null })
  verificationCodeExpiresAt: Date | null;

  @Prop({ required: false, type: String, default: null })
  provider: string | null;

  @Prop({ required: false, type: String, default: null })
  photo: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

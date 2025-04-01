import { IsEmail } from 'class-validator';

export class UserEmailParamDto {
  @IsEmail()
  email: string;
}

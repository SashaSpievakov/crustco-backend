import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

import { TwoFactorMethod } from 'src/common/types/twoFactorMethod.type';

export class TwoFactorVerificationInputDto {
  @ApiProperty({ description: 'The email address of the user', example: 'example@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Verification code',
    example: 'd3e72e',
  })
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  token: string;

  @ApiProperty({
    description: '2FA method',
    example: 'email',
    enum: ['email', 'totp'],
  })
  @IsIn(['email', 'totp'])
  twoFactorMethod: TwoFactorMethod;
}

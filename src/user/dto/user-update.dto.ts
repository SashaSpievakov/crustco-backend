import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

import { TwoFactorMethod } from 'src/common/types/twoFactorMethod.type';

export class UserUpdateDto {
  @ApiProperty({
    description: "User's first name",
    example: 'Jerry',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: "User's last name",
    example: 'Smith',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: '2FA method',
    example: 'email',
    required: false,
  })
  @IsArray()
  @IsOptional()
  twoFactorMethod?: TwoFactorMethod;
}

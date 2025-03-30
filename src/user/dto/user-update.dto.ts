import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

import { Role } from 'src/common/types/role.type';
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
    description: "User's roles",
    example: ['User', 'Admin'],
    isArray: true,
    enum: ['User', 'Admin'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  roles?: Role[];

  @ApiProperty({
    description: 'Indicates if the user verified their email',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;

  @ApiProperty({
    description: '2FA method',
    example: 'email',
    required: false,
  })
  @IsArray()
  @IsOptional()
  twoFactorMethod?: TwoFactorMethod | null;

  @ApiProperty({
    description: 'Flag if TOTP 2FA has been started',
    example: true,
    required: false,
  })
  @IsOptional()
  totp2FAStarted?: boolean | null;

  @ApiProperty({
    description: "User's profile photo URL (null if not set)",
    example: 'https://example.com/profile.jpg',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  photo?: string | null;
}

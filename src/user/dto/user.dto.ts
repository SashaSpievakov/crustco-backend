import { ApiProperty } from '@nestjs/swagger';

import { AuthProvider } from 'src/common/types/provider-user.type';
import { Role } from 'src/common/types/role.type';
import { TwoFactorMethod } from 'src/common/types/twoFactorMethod.type';

export class UserDto {
  @ApiProperty({
    description: 'MongoDB Object ID',
    example: '67b1aa61825821f9d713c890',
  })
  _id: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: "User's first name",
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: "User's last name",
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: "User's roles",
    example: ['User', 'Admin'],
    isArray: true,
    enum: ['User', 'Admin'],
  })
  roles: Role[];

  @ApiProperty({
    description: 'Indicates if the user verified their email',
    example: true,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Email verification code (null if not applicable)',
    example: 'ABC123',
    nullable: true,
  })
  verificationCode: string | null;

  @ApiProperty({
    description: 'Expiration date of verification code (null if not applicable)',
    example: '2025-03-20T14:00:00.000Z',
    nullable: true,
  })
  verificationCodeExpiresAt: Date | null;

  @ApiProperty({
    description: 'Authentication provider (null if registered via email/password)',
    example: 'google',
    enum: ['google', 'facebook', 'github'],
    nullable: true,
  })
  provider: AuthProvider | null;

  @ApiProperty({
    description: 'Two-factor authentication method (null if not enabled)',
    example: 'totp',
    enum: ['email', 'totp'],
    nullable: true,
  })
  twoFactorMethod: TwoFactorMethod | null;

  @ApiProperty({
    description: 'Indicates if TOTP is enabled',
    example: true,
    nullable: true,
  })
  totpEnabled: boolean | null;

  @ApiProperty({
    description: 'Flag indicating if TOTP setup process has started',
    example: false,
    nullable: true,
  })
  totp2FAStarted: boolean | null;

  @ApiProperty({
    description: "User's profile photo URL (null if not set)",
    example: 'https://example.com/profile.jpg',
    nullable: true,
  })
  photo: string | null;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2025-03-10T12:34:56.789Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-03-15T18:45:30.123Z',
  })
  updatedAt: Date;
}

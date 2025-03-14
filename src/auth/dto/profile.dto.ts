import { ApiProperty } from '@nestjs/swagger';

import { AuthProvider } from 'src/common/types/provider-user.type';
import { TwoFactorMethod } from 'src/common/types/twoFactorMethod.type';

export class ProfileDto {
  @ApiProperty({
    description: 'MongoDB Object ID',
    example: '67b1aa61825821f9d713c890',
  })
  _id: string;

  @ApiProperty({ description: 'First name of the person', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'Last name of the person', example: 'Smith' })
  lastName: string;

  @ApiProperty({ description: 'User email', example: 'example@gmail.com' })
  email: string;

  @ApiProperty({ description: 'User roles', example: ['user'] })
  roles: string[];

  @ApiProperty({ description: 'Flag if user email is verified', example: true })
  emailVerified: boolean;

  @ApiProperty({ description: '2FA method for the user', example: 'google' })
  provider: AuthProvider | null;

  @ApiProperty({ description: '2FA method for the user', example: 'email' })
  twoFactorMethod: TwoFactorMethod | null;
}

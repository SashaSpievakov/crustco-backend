import { ApiProperty } from '@nestjs/swagger';

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
}

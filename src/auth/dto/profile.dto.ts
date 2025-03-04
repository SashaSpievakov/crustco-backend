import { ApiProperty } from '@nestjs/swagger';

export class ProfileDto {
  @ApiProperty({
    example: '67b1aa61825821f9d713c890',
    description: 'MongoDB Object ID',
  })
  _id: string;

  @ApiProperty({ example: 'example@gmail.com', description: 'User email' })
  email: string;

  @ApiProperty({ example: ['user'], description: 'User roles' })
  roles: string[];

  @ApiProperty({ example: true, description: 'Flag if user email is verified' })
  emailVerified: boolean;
}

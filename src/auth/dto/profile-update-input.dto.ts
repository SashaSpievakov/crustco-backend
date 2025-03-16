import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class ProfileUpdateDto {
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
    enum: ['email'],
    required: false,
  })
  @IsIn(['email'])
  @IsOptional()
  twoFactorMethod?: 'email' | null;
}

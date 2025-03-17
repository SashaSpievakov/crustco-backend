import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class EmailVerificationInputDto {
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
  code: string;
}

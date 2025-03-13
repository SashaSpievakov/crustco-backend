import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, Matches, MaxLength, MinLength } from 'class-validator';

export class ForgotPasswordInputDto {
  @ApiProperty({ description: 'The email address of the user', example: 'example@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: "The verification code sent to user's email",
    example: 'd3e72e',
  })
  @IsOptional()
  @MinLength(6)
  @MaxLength(6)
  code?: string;

  @ApiPropertyOptional({
    description:
      'The new user password, must contain at least one uppercase letter, one number, and one special character',
    example: 'DiIe3*;wemfke292',
  })
  @IsOptional()
  @MinLength(8)
  @MaxLength(32)
  @Matches(
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>;'[\]\\/])[A-Za-z\d!@#$%^&*(),.?":{}|<>;'[\]\\/]+$/,
    {
      message:
        'Password must contain at least one uppercase letter, one number, and one special character',
    },
  )
  password?: string;
}

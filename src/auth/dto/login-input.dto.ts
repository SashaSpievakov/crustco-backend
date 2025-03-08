import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginInputDto {
  @ApiProperty({ description: 'The email address of the user', example: 'example@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description:
      'The user password, must contain at least one uppercase letter, one number, and one special character',
    example: 'DiIe3*;wemfke292',
  })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  @Matches(
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>;'[\]\\/])[A-Za-z\d!@#$%^&*(),.?":{}|<>;'[\]\\/]+$/,
    {
      message:
        'Password must contain at least one uppercase letter, one number, and one special character',
    },
  )
  password: string;
}

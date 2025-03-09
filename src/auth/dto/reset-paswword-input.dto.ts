import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordInputDto {
  @ApiProperty({
    description: 'The current user password',
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
  oldPassword: string;

  @ApiProperty({
    description:
      'The new user password, must contain at least one uppercase letter, one number, and one special character',
    example: 'oi2&fm2fKLMKe3)(*#mkwIOE',
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
  newPassword: string;
}

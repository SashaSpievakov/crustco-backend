import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { LoginInputDto } from './login-input.dto';

export class RegisterInputDto extends LoginInputDto {
  @ApiProperty({ description: 'First name of the person', example: 'John' })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name of the person', example: 'Smith' })
  @IsNotEmpty()
  lastName: string;
}

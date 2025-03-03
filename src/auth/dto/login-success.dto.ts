import { ApiProperty } from '@nestjs/swagger';

export class LoginSuccessDto {
  @ApiProperty({
    description: 'Success message confirming authentication',
    example: 'Logged in successfully',
  })
  message: string;
}

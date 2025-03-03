import { ApiProperty } from '@nestjs/swagger';

export class LoginFailedDto {
  @ApiProperty({
    description: 'Failed authentication message',
    example: 'Authentication failed. Please check your credentials.',
  })
  message: string;
}

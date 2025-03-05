import { ApiProperty } from '@nestjs/swagger';

export class UnuthorizedErrorResponseDto {
  @ApiProperty({
    description: 'The error message providing details about the issue',
    example: 'Unauthorized',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code of the error response',
    example: 401,
  })
  statusCode: number;

  constructor(statusCode: number, message: string) {
    this.statusCode = statusCode;
    this.message = message;
  }
}

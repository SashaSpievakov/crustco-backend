import { ApiProperty } from '@nestjs/swagger';

export class ServerErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code of the error response',
    example: 500,
  })
  statusCode: number;

  @ApiProperty({
    description: 'The error message providing details about the issue',
    example: 'Internal server error',
  })
  message: string;

  constructor(statusCode: number, message: string) {
    this.statusCode = statusCode;
    this.message = message;
  }
}

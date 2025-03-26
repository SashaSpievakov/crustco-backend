import { ApiProperty } from '@nestjs/swagger';

export class NotFoundErrorResponseDto {
  @ApiProperty({
    description: 'The error message providing details about the issue',
    example: 'User with email "spievakov@vbg.com" not found.',
  })
  message: string;

  @ApiProperty({
    description: 'The error type or category',
    example: 'Not Found',
  })
  error: string;

  @ApiProperty({
    description: 'HTTP status code of the error response',
    example: 404,
  })
  statusCode: number;
}

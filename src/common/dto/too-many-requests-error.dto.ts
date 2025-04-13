import { ApiProperty } from '@nestjs/swagger';

export class TooManyRequestsErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code of the error response',
    example: 429,
  })
  statusCode: number;

  @ApiProperty({
    description: 'The error message providing details about the rate limit violation',
    example: 'ThrottlerException: Too Many Requests',
  })
  message: string;
}

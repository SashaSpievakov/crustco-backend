import { ApiProperty } from '@nestjs/swagger';

export class ForbiddenErrorResponseDto {
  @ApiProperty({
    description: 'The error message providing details about the issue',
    example: 'Access denied: Insufficient permissions',
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Forbidden',
  })
  error: string;

  @ApiProperty({
    description: 'HTTP status code of the error response',
    example: 403,
  })
  statusCode: number;
}

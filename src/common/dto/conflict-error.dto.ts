import { ApiProperty } from '@nestjs/swagger';

export class ConflictErrorResponseDto {
  @ApiProperty({
    description: 'The error message providing details about the issue',
    example: '2FA is already enabled.',
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Conflict',
  })
  error: string;

  @ApiProperty({
    description: 'HTTP status code of the error response',
    example: 409,
  })
  statusCode: number;
}

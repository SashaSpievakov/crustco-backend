import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorResponseDto {
  @ApiProperty({
    description: 'List of validation error messages',
    example: ['id must be a string', 'password must be longer than or equal to 8 characters'],
  })
  message: string[];

  @ApiProperty({
    description: 'The type of error',
    example: 'Bad Request',
  })
  error: string;

  @ApiProperty({
    description: 'The HTTP status code of the error',
    example: 400,
  })
  statusCode: number;
}

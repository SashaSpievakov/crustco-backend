import { ApiProperty } from '@nestjs/swagger';

export class CreateErrorResponseDto {
  @ApiProperty({
    description: 'List of validation error messages',
    example: ['id must be a string'],
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

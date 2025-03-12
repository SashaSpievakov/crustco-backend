import { ApiProperty } from '@nestjs/swagger';

export class GeneralUserErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code of the error response',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'The error message providing details about the issue',
    example: 'Bad Request',
  })
  message: string;
}

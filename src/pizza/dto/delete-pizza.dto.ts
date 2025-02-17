import { ApiProperty } from '@nestjs/swagger';

export class DeletePizzaResponseDto {
  @ApiProperty({
    description: 'Success message confirming pizza deletion',
    example: 'The pizza with #40 was successfully deleted',
  })
  message: string;
}

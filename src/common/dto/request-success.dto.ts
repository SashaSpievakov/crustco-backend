import { ApiProperty } from '@nestjs/swagger';

export class RequestSuccessDto {
  @ApiProperty({
    description: 'Successful operation message',
    example: 'Successfuly completed operation',
  })
  message: string;
}

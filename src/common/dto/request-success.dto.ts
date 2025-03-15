import { ApiProperty } from '@nestjs/swagger';

export class RequestSuccessDto {
  @ApiProperty({
    description: 'Message indicating the success of the operation',
    example: 'Successfuly completed operation',
  })
  message: string;
}

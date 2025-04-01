import { ApiProperty } from '@nestjs/swagger';

import { TwoFactorMethod } from 'src/common/types/twoFactorMethod.type';

export class TwoFactorSuccess {
  @ApiProperty({
    description: 'Message indicating the success of the operation',
    example: 'Successfully completed operation',
  })
  message: string;

  @ApiProperty({
    description: 'The 2FA method used for authentication',
    example: 'email',
  })
  method: TwoFactorMethod;
}

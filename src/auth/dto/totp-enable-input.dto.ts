import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { TotpDisableInputDto } from './totp-disable-input.dto';

export class TotpEnableInputDto extends TotpDisableInputDto {
  @ApiProperty({
    description: 'The TOTP secret that will be used to generate 2FA codes for this user.',
    example: 'JBSWY3DPEHPK3PXP',
  })
  @IsString()
  @IsNotEmpty()
  secret: string;
}

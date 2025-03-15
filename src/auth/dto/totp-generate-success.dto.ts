import { ApiProperty } from '@nestjs/swagger';

export class TotpGenerateSuccessDto {
  @ApiProperty({
    description: 'The QR code URL to be scanned by the user in their TOTP authenticator app.',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...',
  })
  qrCodeUrl: string;

  @ApiProperty({
    description: 'The TOTP secret that will be used to generate 2FA codes for this user.',
    example: 'JBSWY3DPEHPK3PXP',
  })
  secret: string;
}

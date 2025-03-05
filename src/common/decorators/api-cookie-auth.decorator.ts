import { applyDecorators } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';

export function ApiCookieAuth() {
  return applyDecorators(ApiSecurity('cookieAuth'));
}

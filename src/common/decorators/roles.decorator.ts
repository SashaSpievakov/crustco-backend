import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { ForbiddenErrorResponseDto } from '../dto/forbidden-error.dto';
import { Role } from '../types/role.type';
import { ApiCookieAuth } from './api-cookie-auth.decorator';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) =>
  applyDecorators(
    ApiCookieAuth(),
    SetMetadata(ROLES_KEY, roles),
    ApiResponse({
      status: 403,
      description: 'Forbidden',
      type: ForbiddenErrorResponseDto,
    }),
  );

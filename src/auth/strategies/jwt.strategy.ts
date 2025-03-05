import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return (request?.cookies?.access_token as string) || null;
        },
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET') || '',
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    if (!payload) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return payload; // `request.user` will now contain this payload
  }
}

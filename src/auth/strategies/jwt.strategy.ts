// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';
// import { PassportStrategy } from '@nestjs/passport';
// import { Request } from 'express';
// import { Strategy } from 'passport-jwt';

// import { UserService } from '../../user/user.service';
// import { JwtPayload } from '../interfaces/jwt-payload.interface';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     private readonly userService: UserService,
//     private readonly jwtService: JwtService,
//     private readonly configService: ConfigService,
//   ) {
//     super({
//       jwtFromRequest: (req: Request) => {
//         if (req && req.cookies) {
//           return req.cookies['access_token'] as string; // Extract JWT from cookies
//         }
//         return null;
//       },
//       ignoreExpiration: false,
//       secretOrKey: configService.get<string>('JWT_SECRET') || '', // Secret key for verifying JWT
//     });
//   }

//   async validate(payload: JwtPayload) {
//     const { sub } = payload;
//     const user = await this.userService.findOneById(sub);
//     if (!user) {
//       throw new UnauthorizedException('Unauthorized');
//     }
//     return user; // Attach user to request object (e.g., req.user)
//   }
// }

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

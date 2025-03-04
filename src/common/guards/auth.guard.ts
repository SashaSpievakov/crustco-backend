// import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';
// import { Request } from 'express';

// import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

// @Injectable()
// export class AuthGuard implements CanActivate {
//   constructor(
//     private jwtService: JwtService,
//     private configService: ConfigService,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest<Request>();
//     const token = this.extractTokenFromCookie(request);

//     if (!token) {
//       throw new UnauthorizedException('No access token provided');
//     }

//     try {
//       const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
//         secret: this.configService.get<string>('JWT_SECRET'),
//       });
//       request.user = payload;
//       return true;
//     } catch {
//       throw new UnauthorizedException('Invalid or expired token');
//     }
//   }

//   private extractTokenFromCookie(request: Request): string | null {
//     return (request.cookies?.access_token as string) || null;
//   }
// }

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

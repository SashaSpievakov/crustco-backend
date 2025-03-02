import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { Response } from 'express';

import { AuthGuard } from 'src/common/guards/auth.guard';

import { AuthService } from './auth.service';

export interface IRequest {
  user: Record<any, any>;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiBody({})
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }, @Res() res: Response) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user, res);
  }

  @ApiBody({})
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    return await this.authService.register(email, password);
  }

  @ApiBody({})
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() body: { email: string; code: string }, @Res() res: Response) {
    return await this.authService.verifyEmail(body.email, body.code, res);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: { refreshToken: string }, @Res() res: Response) {
    return this.authService.refreshToken(body.refreshToken, res);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: IRequest) {
    return req.user;
  }
}

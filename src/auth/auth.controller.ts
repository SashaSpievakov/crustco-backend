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
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';

import { CreateValidationErrorResponseDto } from 'src/common/dto/create-validation-error.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginFailedDto } from './dto/login-failed.dto';
import { LoginSuccessDto } from './dto/login-success.dto';

// Delete me
export interface IRequest {
  user: Record<any, any>;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Log in into your account' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Logged in successfully',
    type: LoginSuccessDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
    type: CreateValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: LoginFailedDto,
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user, res);
  }

  @ApiBody({})
  @Post('register')
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

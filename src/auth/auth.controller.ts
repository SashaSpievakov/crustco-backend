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

import { RequestSuccessDto } from 'src/common/dto/request-success.dto';
import { ValidationErrorResponseDto } from 'src/common/dto/validation-error.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';

import { AuthService } from './auth.service';
import { AuthenticateInputDto } from './dto/authenticate-input.dto';
import { LoginFailedDto } from './dto/login-failed.dto';
import { VerificationInputDto } from './dto/verification-input.dto';

// Delete me
export interface IRequest {
  user: Record<any, any>;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Log in into your account' })
  @ApiBody({ type: AuthenticateInputDto })
  @ApiResponse({
    status: 200,
    description: 'Logged in successfully',
    type: RequestSuccessDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: LoginFailedDto,
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginBody: AuthenticateInputDto,
    @Res() res: Response,
  ): Promise<RequestSuccessDto | void> {
    const user = await this.authService.validateUser(loginBody.email, loginBody.password);
    return this.authService.login(user, res);
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: AuthenticateInputDto })
  @ApiResponse({
    status: 201,
    description: 'Registration requested',
    type: RequestSuccessDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
    type: ValidationErrorResponseDto,
  })
  @Post('register')
  async register(@Body() registerBody: AuthenticateInputDto): Promise<RequestSuccessDto> {
    return await this.authService.register(registerBody.email, registerBody.password);
  }

  @ApiOperation({ summary: "Vefify user's email" })
  @ApiBody({ type: VerificationInputDto })
  @ApiResponse({
    status: 200,
    description: 'Verification is successful',
    type: RequestSuccessDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
    type: ValidationErrorResponseDto,
  })
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body() verificationBody: VerificationInputDto,
    @Res() res: Response,
  ): Promise<RequestSuccessDto | void> {
    const { email, code } = verificationBody;
    return await this.authService.verifyEmail(email, code, res);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() body: { refreshToken: string },
    @Res() res: Response,
  ): Promise<RequestSuccessDto | void> {
    return this.authService.refreshToken(body.refreshToken, res);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: IRequest) {
    return req.user;
  }
}

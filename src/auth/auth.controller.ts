import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest, Response } from 'express';

import { ApiCookieAuth } from 'src/common/decorators/api-cookie-auth.decorator';
import { RequestSuccessDto } from 'src/common/dto/request-success.dto';
import { UnuthorizedErrorResponseDto } from 'src/common/dto/unuthorized-error.dto';
import { ValidationErrorResponseDto } from 'src/common/dto/validation-error.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';

import { AuthService } from './auth.service';
import { AuthenticateInputDto } from './dto/authenticate-input.dto';
import { LoginFailedDto } from './dto/login-failed.dto';
import { ProfileDto } from './dto/profile.dto';
import { VerificationInputDto } from './dto/verification-input.dto';

@ApiTags('Auth')
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
    return await this.authService.register(
      registerBody.email,
      registerBody.password,
      registerBody.firstName,
      registerBody.lastName,
    );
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

  @ApiOperation({ summary: 'Get new access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refresh successful',
    type: RequestSuccessDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnuthorizedErrorResponseDto,
  })
  @Get('refresh-token')
  async refreshToken(
    @Req() req: ExpressRequest,
    @Res() res: Response,
  ): Promise<RequestSuccessDto | void> {
    const refreshToken: string | undefined = req.cookies?.refresh_token as string;

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    return this.authService.refreshToken(refreshToken, res);
  }

  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile',
    type: ProfileDto,
  })
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: ExpressRequest): Promise<ProfileDto> {
    const accessToken: string | undefined = req.cookies?.access_token as string;
    return await this.authService.getProfile(accessToken);
  }
}

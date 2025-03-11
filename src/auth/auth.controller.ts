import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  ParseBoolPipe,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { ApiCookieAuth } from 'src/common/decorators/api-cookie-auth.decorator';
import { RequestSuccessDto } from 'src/common/dto/request-success.dto';
import { UnuthorizedErrorResponseDto } from 'src/common/dto/unuthorized-error.dto';
import { ValidationErrorResponseDto } from 'src/common/dto/validation-error.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { AuthenticatedRequest } from 'src/common/types/authenticated-request';

import { AuthService } from './auth.service';
import { LoginFailedDto } from './dto/login-failed.dto';
import { LoginInputDto } from './dto/login-input.dto';
import { ProfileDto } from './dto/profile.dto';
import { RegisterInputDto } from './dto/register-input.dto';
import { ResetPasswordInputDto } from './dto/reset-paswword-input.dto';
import { VerificationInputDto } from './dto/verification-input.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Log in into your account' })
  @ApiBody({ type: LoginInputDto })
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
    @Body() loginBody: LoginInputDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<RequestSuccessDto | void> {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    const user = await this.authService.validateUser(loginBody.email, loginBody.password);
    return this.authService.login(user, userAgent, ipAddress, res);
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterInputDto })
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
  async register(@Body() registerBody: RegisterInputDto): Promise<RequestSuccessDto> {
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
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<RequestSuccessDto | void> {
    const { email, code } = verificationBody;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    return await this.authService.verifyEmail(email, code, userAgent, ipAddress, res);
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
  async refreshToken(@Req() req: Request, @Res() res: Response): Promise<RequestSuccessDto | void> {
    const refreshToken: string | undefined = req.cookies?.refresh_token as string;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    return this.authService.refreshToken(refreshToken, userAgent, res);
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
  async getProfile(@Req() req: AuthenticatedRequest): Promise<ProfileDto> {
    return await this.authService.getProfile(req.user.sub);
  }

  @ApiOperation({ summary: 'Reset user password' })
  @ApiBody({ type: ResetPasswordInputDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: RequestSuccessDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
    type: ValidationErrorResponseDto,
  })
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetBody: ResetPasswordInputDto,
    @Req() req: Request,
  ): Promise<RequestSuccessDto> {
    const accessToken: string = req.cookies?.access_token as string;

    await this.authService.resetPassword(accessToken, resetBody.oldPassword, resetBody.newPassword);
    return { message: 'Password reset successfully.' };
  }

  @ApiOperation({ summary: 'Log out of the account' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged out',
    type: RequestSuccessDto,
  })
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res() res: Response,
    @Query('logoutAll', new DefaultValuePipe(false), ParseBoolPipe) logoutAll: boolean,
  ): Promise<RequestSuccessDto | void> {
    const refreshToken: string = req.cookies?.refresh_token as string;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    return await this.authService.logout(logoutAll, refreshToken, userAgent, res);
  }
}

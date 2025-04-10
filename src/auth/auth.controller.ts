import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, OmitType } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { ApiCookieAuth } from 'src/common/decorators/api-cookie-auth.decorator';
import { ConflictErrorResponseDto } from 'src/common/dto/conflict-error.dto';
import { RequestSuccessDto } from 'src/common/dto/request-success.dto';
import { UnauthorizedErrorResponseDto } from 'src/common/dto/unauthorized-error.dto';
import { GithubAuthGuard } from 'src/common/guards/github-auth.guard';
import { GoogleAuthGuard } from 'src/common/guards/google-auth.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/common/types/authenticated-request.type';
import { GoogleAuthenticatedRequest } from 'src/common/types/google-authenticated-request.type';
import { UserDto } from 'src/users/dto/user.dto';

import { AuthService } from './auth.service';
import { EmailVerificationInputDto } from './dto/email-verification-input.dto';
import { ForgotPasswordInputDto } from './dto/forgot-password-input.dto';
import { LoginFailedDto } from './dto/login-failed.dto';
import { LoginInputDto } from './dto/login-input.dto';
import { ProfileUpdateDto } from './dto/profile-update-input.dto';
import { RegisterInputDto } from './dto/register-input.dto';
import { ResetPasswordInputDto } from './dto/reset-password-input.dto';
import { TotpDisableInputDto } from './dto/totp-disable-input.dto';
import { TotpEnableInputDto } from './dto/totp-enable-input.dto';
import { TotpGenerateSuccessDto } from './dto/totp-generate-success.dto';
import { TwoFactorSuccess } from './dto/two-factor-success.dto';
import { TwoFactorVerificationInputDto } from './dto/two-factor-verification-input.dto';

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
    status: 202,
    description: 'Two-factor authentication required',
    type: TwoFactorSuccess,
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
  ): Promise<RequestSuccessDto | TwoFactorSuccess | void> {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    const user = await this.authService.validateUser(loginBody.email, loginBody.password);

    if (user.twoFactorMethod) {
      await this.authService.request2FA(user._id, user.twoFactorMethod);

      res.status(HttpStatus.ACCEPTED).json({
        message: 'Two-factor authentication required.',
        method: user.twoFactorMethod,
      });
      return;
    }

    return this.authService.login(user, userAgent, ipAddress, res);
  }

  @ApiOperation({
    summary: 'Verify Two-Factor Authentication (2FA) Code',
    description: 'Validates the provided 2FA code and grants access if the code is correct.',
  })
  @ApiBody({ type: TwoFactorVerificationInputDto })
  @ApiResponse({
    status: 200,
    description: 'Logged in successfully',
    type: RequestSuccessDto,
  })
  @Post('verify-2fa')
  @HttpCode(HttpStatus.OK)
  async verify2FA(
    @Body() verificationBody: TwoFactorVerificationInputDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<RequestSuccessDto | void> {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    let user;

    if (verificationBody.twoFactorMethod === 'email') {
      user = await this.authService.verifyEmail2FA(verificationBody.email, verificationBody.token);
    } else if (verificationBody.twoFactorMethod === 'totp') {
      user = await this.authService.verifyTotp2FA(verificationBody.email, verificationBody.token);
    }

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.authService.login(user, userAgent, ipAddress, res);
  }

  @ApiOperation({ summary: 'Generate TOTP' })
  @ApiResponse({
    status: 200,
    description: 'Successfully generated TOTP secret and QR code URL',
    type: TotpGenerateSuccessDto,
  })
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @Get('totp-generate')
  async generateTOTP(@Req() req: AuthenticatedRequest): Promise<TotpGenerateSuccessDto> {
    return await this.authService.generateTotp(req.user.sub);
  }

  @ApiOperation({ summary: 'Enable TOTP' })
  @ApiBody({ type: TotpEnableInputDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully enabled TOTP verification',
    type: RequestSuccessDto,
  })
  @ApiResponse({
    status: 409,
    description: 'TOTP is already enabled for this user',
    type: ConflictErrorResponseDto,
  })
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @Post('totp-enable')
  @HttpCode(HttpStatus.OK)
  async enableTOTP(
    @Body() totpBody: TotpEnableInputDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<RequestSuccessDto> {
    await this.authService.enableTotpVerification(req.user.sub, totpBody.token, totpBody.secret);
    return { message: 'TOTP authentication successfully enabled.' };
  }

  @ApiOperation({ summary: 'Disable TOTP' })
  @ApiBody({ type: TotpDisableInputDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully disabled TOTP verification',
    type: RequestSuccessDto,
  })
  @ApiResponse({
    status: 409,
    description: 'TOTP is not enabled for this user',
    type: ConflictErrorResponseDto,
  })
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @Post('totp-disable')
  @HttpCode(HttpStatus.OK)
  async disableTOTP(
    @Body() totpBody: TotpDisableInputDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<RequestSuccessDto> {
    await this.authService.disableTotpVerification(req.user.sub, totpBody.token);
    return { message: 'TOTP authentication successfully disabled.' };
  }

  @ApiOperation({
    summary: 'Redirect to Google login',
    description: 'Starts the Google OAuth authentication flow.',
  })
  @ApiResponse({ status: 302, description: 'Redirects user to Google login page' })
  @Get('login-google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  @ApiOperation({
    summary: 'Handle Google OAuth callback',
    description: 'Processes the OAuth callback from Google after user authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authorized successfully with Google',
    type: RequestSuccessDto,
  })
  @ApiResponse({
    status: 202,
    description: 'Two-factor authentication required',
    type: TwoFactorSuccess,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @Get('google-callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @Req() req: GoogleAuthenticatedRequest,
    @Res() res: Response,
  ): Promise<RequestSuccessDto | TwoFactorSuccess | void> {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    await this.authService.loginWithProvider(req.user, 'google', userAgent, ipAddress, res);
  }

  @ApiOperation({
    summary: 'Redirect to GitHub login',
    description: 'Starts the GitHub OAuth authentication flow.',
  })
  @ApiResponse({ status: 302, description: 'Redirects user to GitHub login page' })
  @Get('login-github')
  @UseGuards(GithubAuthGuard)
  githubLogin() {}

  @ApiOperation({
    summary: 'Handle GitHub OAuth callback',
    description: 'Processes the OAuth callback from GitHub after user authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authorized successfully with GitHub',
    type: RequestSuccessDto,
  })
  @ApiResponse({
    status: 202,
    description: 'Two-factor authentication required',
    type: TwoFactorSuccess,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedErrorResponseDto,
  })
  @Get('github-callback')
  @UseGuards(GithubAuthGuard)
  async githubAuthRedirect(
    @Req() req: GoogleAuthenticatedRequest,
    @Res() res: Response,
  ): Promise<RequestSuccessDto | TwoFactorSuccess | void> {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    await this.authService.loginWithProvider(req.user, 'github', userAgent, ipAddress, res);
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterInputDto })
  @ApiResponse({
    status: 201,
    description: 'Registration requested',
    type: RequestSuccessDto,
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
  @ApiBody({ type: EmailVerificationInputDto })
  @ApiResponse({
    status: 200,
    description: 'Verification is successful',
    type: RequestSuccessDto,
  })
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body() verificationBody: EmailVerificationInputDto,
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
    type: UnauthorizedErrorResponseDto,
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
    type: OmitType(UserDto, ['verificationCode', 'verificationCodeExpiresAt', 'totp2FAStarted']),
  })
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(
    @Req() req: AuthenticatedRequest,
  ): Promise<Omit<UserDto, 'verificationCode' | 'verificationCodeExpiresAt' | 'totp2FAStarted'>> {
    return await this.authService.getProfile(req.user.sub);
  }

  @ApiOperation({ summary: 'Update the profile' })
  @ApiBody({ type: ProfileUpdateDto })
  @ApiResponse({
    status: 200,
    description: 'Updated user profile',
    type: OmitType(UserDto, ['verificationCode', 'verificationCodeExpiresAt', 'totp2FAStarted']),
  })
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async update(
    @Body() updateProfileBody: ProfileUpdateDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Omit<UserDto, 'verificationCode' | 'verificationCodeExpiresAt' | 'totp2FAStarted'>> {
    const updatedProfile = await this.authService.updateProfile(req.user.sub, updateProfileBody);
    return updatedProfile;
  }

  @ApiOperation({ summary: 'Reset user password' })
  @ApiBody({ type: ResetPasswordInputDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: RequestSuccessDto,
  })
  @ApiCookieAuth()
  @UseGuards(JwtAuthGuard)
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetBody: ResetPasswordInputDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<RequestSuccessDto> {
    await this.authService.resetPassword(
      req.user.sub,
      resetBody.oldPassword,
      resetBody.newPassword,
    );
    return { message: 'Password reset successfully.' };
  }

  @ApiOperation({ summary: 'Forgot password' })
  @ApiBody({ type: ForgotPasswordInputDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: RequestSuccessDto,
  })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotBody: ForgotPasswordInputDto): Promise<RequestSuccessDto> {
    const user = await this.authService.forgotPassword(
      forgotBody.email,
      forgotBody.code,
      forgotBody.password,
    );

    if (user) {
      return { message: 'Password updated successfully' };
    } else {
      return { message: 'If this email exists, a reset link has been sent.' };
    }
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

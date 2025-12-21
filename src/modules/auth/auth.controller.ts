import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { OtpService } from './otp.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private otpService: OtpService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    // Create user
    const user = await this.authService.register(createUserDto);

    // Send OTP
    await this.otpService.sendVerificationOtp(user.id);

    return {
      message:
        'Registration successful. Please check your email for verification code.',
      userId: user.id,
      email: user.email,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(
    @CurrentUser()
    user: {
      id: string;
      email: string;
      role: string;
      isEmailVerified: boolean;
    },
  ) {
    return {
      message: 'Profile retrieved successfully',
      data: user,
    };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // This route redirects to Google OAuth consent screen
    // This guard handles the redirect
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    // Generate JWT toekn for the user
    const tokens = this.authService.generateTokens(req.user);

    // For now, just redirect to frontend with token in URL
    // In production, you'd handle this more securely
    const googleAuthRedirect = this.configService.get<string>(
      'GOOGLE_AUTH_REDIRECT',
    );
    res.redirect(`${googleAuthRedirect}?token=${tokens.accessToken}`);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.otpService.verifyOtp(verifyOtpDto.userId, verifyOtpDto.otp);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.otpService.resendOtp(resendOtpDto.userId);
  }
}

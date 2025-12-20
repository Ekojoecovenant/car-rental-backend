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

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
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
}

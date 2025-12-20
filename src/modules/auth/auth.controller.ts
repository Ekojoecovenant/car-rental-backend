/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/await-thenable */
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
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    // Generate JWT toekn for the user
    const tokens = await this.authService.generateTokens(req.user);

    // For now, just redirect to frontend with token in URL
    // In production, you'd handle this more securely
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${tokens.accessToken}`,
    );
  }
}

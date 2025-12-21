import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { EmailService } from '../notifications/email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  constructor(
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  generateOtp(): string {
    // Generate 6-digit OTP
    return crypto.randomInt(100000, 999999).toString();
  }

  async sendVerificationOtp(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save OTP to database
    await this.usersService.saveVerificationToken(userId, otp, expiresAt);

    // Send email
    await this.emailService.sendVerificationEmail(
      user.email,
      otp,
      user.fullName,
    );

    return {
      message: 'Verification code sent to your email',
      expiresIn: '10 minutes',
    };
  }

  async verifyOtp(userId: string, otp: string) {
    const user = await this.usersService.findByIdWithToken(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    if (!user.emailVerificationToken) {
      throw new BadRequestException(
        'No verification code found. Please request a new one.',
      );
    }

    if (user.emailVerificationExpires < new Date()) {
      throw new BadRequestException(
        'Verification code expired. Please request a new one.',
      );
    }

    if (user.emailVerificationToken !== otp) {
      throw new BadRequestException('Invalid verification code');
    }

    // Mark email as verified and clear OTP
    await this.usersService.markEmailAsVerified(userId);

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.fullName);

    return {
      message: 'Email verified successfully',
      isEmailVerified: true,
    };
  }

  async resendOtp(userId: string) {
    return this.sendVerificationOtp(userId);
  }
}

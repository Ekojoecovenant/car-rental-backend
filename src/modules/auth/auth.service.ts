/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthProvider } from '../users/entities/user.entity';

interface GoogleUserData {
  googleId: string;
  email: string;
  fullName: string;
  profilePicture?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    // Find user with password field (normally excluded)
    const user = await this.usersService.findByEmailWithPassword(
      loginDto.email,
    );
    console.log(user);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Check if user registered with Google (no password set)
    if (
      user.authProvider === AuthProvider.GOOGLE &&
      (!user.password || user.password === null)
    ) {
      console.log(user.password);
      throw new UnauthorizedException(
        'This account was created with Google, Please use "Continue with Google" to login.',
      );
    }

    // Get user with password for validation
    // const userWithPassword = await this.usersService.findByEmailWithPassword(
    //   loginDto.email,
    // );

    // Additional safety check - if password is null, reject
    if (!user.password) {
      throw new UnauthorizedException(
        'This account has no password set. Please use social login or reset your password.',
      );
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(loginDto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async register(createUserDto: any) {
    return this.usersService.create(createUserDto);
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }

  async validateGoogleUser(googleData: GoogleUserData) {
    // Check if user exists by Google ID
    let user = await this.usersService.findByGoogleId(googleData.googleId);

    if (user) {
      return user; // User already registered with Google
    }

    // Check if user exists by email (registered with email/password before)
    user = await this.usersService.findByEmail(googleData.email);

    if (user) {
      // Link Google acccount to existing user
      return this.usersService.linkGoogleAccount(user.id, googleData.googleId);
    }

    // Create new user with Google OAuth
    return this.usersService.createGoogleUser({
      email: googleData.email,
      fullName: googleData.fullName,
      googleId: googleData.googleId,
      authProvider: AuthProvider.GOOGLE,
      isEmailVerified: true,
    });
  }

  generateTokens(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}

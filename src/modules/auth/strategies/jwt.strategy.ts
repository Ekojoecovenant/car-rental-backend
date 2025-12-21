import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import type { UserRole } from '../../users/entities/user.entity';

interface ValidateUserData {
  id: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private cache = new Map<string, any>(); // In-memory cache

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<ValidateUserData> {
    const cacheKey = `user:${payload.sub}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log(`✅ Cache hit for user:`, payload.sub); // For testing
      return this.cache.get(cacheKey) as ValidateUserData;
    }

    console.log(`❌ Cache miss - querying DB for user:`, payload.sub); // For testing

    // If not in cache, fetch from DB
    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const userData: ValidateUserData = {
      id: user.id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };

    // Cache for 5 minutes
    this.cache.set(cacheKey, userData);
    setTimeout(
      () => {
        this.cache.delete(cacheKey);
        console.log(`🗑️ Cache expired for user:`, payload.sub);
      },
      5 * 60 * 1000,
    );

    // This object gets attached to request.user
    return userData;
  }
}

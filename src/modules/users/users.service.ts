import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthProvider, User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Creates a new user
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });
    return user as User;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // Check if email is being changed and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    user.isActive = false; // Soft delete
    await this.usersRepository.save(user);
  }

  async findByEmailWithPassword(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: [
        'id',
        'fullName',
        'email',
        'phoneNumber',
        'password', // Explicitly include password
        'role',
        'authProvider',
        'googleId',
        'isEmailVerified',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });
    return user as User;
  }

  async findByGoogleId(googleId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { googleId } });
    return user as User;
  }

  async createGoogleUser(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create({
      ...userData,
      isEmailVerified: true, // Google emails are already verified
    });
    return this.usersRepository.save(user);
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<User> {
    const user = await this.findById(userId);
    user.googleId = googleId;
    user.authProvider = AuthProvider.GOOGLE;
    user.isEmailVerified = true;
    return this.usersRepository.save(user);
  }

  async saveVerificationToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    const user = await this.findById(userId);
    user.emailVerificationToken = token;
    user.emailVerificationExpires = expiresAt;
    await this.usersRepository.save(user);
  }

  async findByIdWithToken(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'email',
        'fullName',
        'isEmailVerified',
        'emailVerificationToken',
        'emailVerificationExpires',
      ],
    });
    return user as User;
  }

  async markEmailAsVerified(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    });
  }
}

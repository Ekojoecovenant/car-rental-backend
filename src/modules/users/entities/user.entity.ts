import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

// Define user roles
export enum UserRole {
  CUSTOMER = 'customer',
  DRIVER = 'driver',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

// Define authentication providers
export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false, nullable: true })
  password: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
    name: 'auth_provider',
  })
  authProvider: AuthProvider;

  @Column({ name: 'google_id', nullable: true, unique: true })
  googleId: string;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({
    name: 'email_verification_token',
    nullable: true,
    select: false,
  })
  emailVerificationToken: string;

  @Column({
    name: 'email_verfication_expires',
    type: 'timestamp',
    nullable: true,
  })
  emailVerificationExpires: Date;

  // Automatically hash password before saving
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  // Method to validate password
  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}

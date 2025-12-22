import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum VehicleCategory {
  SEDAN = 'sedan',
  SUV = 'suv',
  TRUCK = 'truck',
  VAN = 'van',
}

export enum TransmissionType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
}

export enum FuelType {
  PETROL = 'petrol',
  DIESEL = 'diesel',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
}

@Entity('vehicle')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  make: string; // "Toyota"

  @Column()
  model: string; // "Corolla"

  @Column()
  year: number; // 2023

  @Column({
    type: 'enum',
    enum: VehicleCategory,
  })
  category: VehicleCategory; // sedan, suv, truck, van

  @Column({ type: 'decimal', name: 'daily_rate', precision: 10, scale: 2 })
  dailyRate: number; // 100.00

  @Column({ name: 'seating_capacity' })
  seatingCapacity: number; // 5

  @Column({
    type: 'enum',
    enum: TransmissionType,
  })
  transmission: TransmissionType; // manual, automatic

  @Column({
    name: 'fuel_type',
    type: 'enum',
    enum: FuelType,
  })
  FuelType: FuelType; // petrol, diesel, electric, hybrid

  @Column({ type: 'text', nullable: true })
  features: string;

  @Column({ type: 'text', nullable: true })
  description: string; // Optional description

  @Column({ type: 'simple-array' })
  images: string[];

  @Column({ name: 'requires_driver', default: false })
  requiresDriver: boolean;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updateDAt: Date;
}

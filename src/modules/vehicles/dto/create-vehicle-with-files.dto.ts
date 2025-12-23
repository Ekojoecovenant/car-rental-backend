import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  FuelType,
  TransmissionType,
  VehicleCategory,
} from '../entities/vehicle.entity';

export class CreateVehicleWithFilesDto {
  @IsNotEmpty()
  @IsString()
  make: string;

  @IsNotEmpty()
  @IsString()
  model: string;

  @IsNotEmpty()
  @IsString()
  year: string;

  @IsNotEmpty()
  @IsEnum(VehicleCategory)
  category: VehicleCategory;

  @IsNotEmpty()
  @IsString()
  dailyRate: string;

  @IsNotEmpty()
  @IsString()
  seatingCapacity: string;

  @IsNotEmpty()
  @IsEnum(TransmissionType)
  transmission: TransmissionType;

  @IsNotEmpty()
  @IsEnum(FuelType)
  fuelType: FuelType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  features?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  requiresDriver?: string;
}

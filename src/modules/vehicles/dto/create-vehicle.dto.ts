import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  FuelType,
  TransmissionType,
  VehicleCategory,
} from '../entities/vehicle.entity';

export class CreateVehicleDto {
  @IsNotEmpty()
  @IsString()
  make: string;

  @IsNotEmpty()
  @IsString()
  model: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @IsNotEmpty()
  @IsEnum(VehicleCategory)
  category: VehicleCategory;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  dailyRate: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(50)
  seatingCapacity: number;

  @IsNotEmpty()
  @IsEnum(TransmissionType)
  transmission: TransmissionType;

  @IsNotEmpty()
  @IsEnum(FuelType)
  FuelType: FuelType;

  @IsOptional()
  @IsString()
  @MaxLength(700)
  features?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  description?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least 1 image is required' })
  @ArrayMaxSize(3, { message: 'Maximum 3 images allowed' })
  @IsString({ each: true })
  images: string[];

  @IsOptional()
  @IsBoolean()
  requiresDriver?: boolean;
}

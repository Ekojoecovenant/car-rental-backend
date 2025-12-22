import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { VehicleCategory } from '../entities/vehicle.entity';
import { Type } from 'class-transformer';

export class FilterVehicleDto {
  @IsOptional()
  @IsEnum(VehicleCategory)
  category?: VehicleCategory;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}

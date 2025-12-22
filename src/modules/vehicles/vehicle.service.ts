import { Injectable, NotFoundException } from '@nestjs/common';
import { Vehicle } from './entities/vehicle.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-user.dto';
import { FilterVehicleDto } from './dto/filter-vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const vehicle = this.vehicleRepository.create(createVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }

  async findAll(filterDto?: FilterVehicleDto): Promise<Vehicle[]> {
    const query = this.vehicleRepository
      .createQueryBuilder('vehicle')
      .where('vehicle.isActive = :isActive', { isActive: true });

    // Filter by category
    if (filterDto?.category) {
      query.andWhere('vehicle.category = :category', {
        category: filterDto.category,
      });
    }

    // Filter by price range
    if (filterDto?.minPrice) {
      query.andWhere('vehicle.dailyRate >= :minPrice', {
        minPrice: filterDto.minPrice,
      });
    }

    if (filterDto?.maxPrice) {
      query.andWhere('vehicle.dailyRate >= :maxPrice', {
        maxPrice: filterDto.maxPrice,
      });
    }

    return query.orderBy('vehilce.createdAt', 'DESC').getMany();
    // return this.vehicleRepository.find();
  }

  async findById(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id, isActive: true },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async update(
    id: string,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    const vehicle = await this.findById(id);

    Object.assign(vehicle, updateVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }

  async toggleAvailability(id: string): Promise<Vehicle> {
    const vehicle = await this.findById(id);
    vehicle.isAvailable = !vehicle.isAvailable;
    return this.vehicleRepository.save(vehicle);
  }

  async remove(id: string): Promise<void> {
    const vehicle = await this.findById(id);
    vehicle.isActive = false;
    await this.vehicleRepository.save(vehicle);
  }
}

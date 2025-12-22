import { Injectable, NotFoundException } from '@nestjs/common';
import { Vehicle } from './entities/vehicle.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-user.dto';

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

  async findAll(): Promise<Vehicle[]> {
    return this.vehicleRepository.find();
  }

  async findById(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
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

  async remove(id: string): Promise<void> {
    const vehicle = await this.findById(id);
    vehicle.isActive = false;
    await this.vehicleRepository.save(vehicle);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-user.dto';

@Controller('vehicle')
export class Vehicle {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    const vehicle = await this.vehicleService.create(createVehicleDto);
    return {
      message: 'Vehicle created successfully.',
      data: vehicle,
    };
  }

  @Get()
  async findAll() {
    const vehicles = await this.vehicleService.findAll();
    return {
      message: 'Vehicles retrieved successfully',
      data: vehicles,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const vehicle = await this.vehicleService.findById(id);

    return {
      message: 'Vehicle retrieved successfully',
      data: vehicle,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    const vehicle = await this.vehicleService.update(id, updateVehicleDto);

    return {
      message: 'Vehicle updated successfully',
      data: vehicle,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.vehicleService.remove(id);
  }
}

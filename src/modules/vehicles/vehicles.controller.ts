import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-user.dto';
import { CloudinaryService } from './cloudinary.service';
import { FilterVehicleDto } from './dto/filter-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('vehicles')
export class VehiclesController {
  constructor(
    private readonly vehicleService: VehiclesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // PUBLIC: Browse all vehicles
  @Get()
  async findAll(@Query() filterDto: FilterVehicleDto) {
    const vehicles = await this.vehicleService.findAll(filterDto);

    return {
      message: 'Vehicles retrieved successfully',
      data: vehicles,
      count: vehicles.length,
    };
  }

  // PUBLIC: Get single vehicle details
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const vehicle = await this.vehicleService.findById(id);

    return {
      message: 'Vehicle retrieved successfully',
      data: vehicle,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 3))
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createVehicleDto: CreateVehicleDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Validate files
    if (!files || files.length === 0) {
      throw new BadRequestException('At least 1 image is required');
    }

    if (files.length > 3) {
      throw new BadRequestException('Maximum 3 images allowed');
    }

    // Validate file types and sizes
    for (const file of files) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException('Only JPEG, PNG and WebP images allowed');
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new BadRequestException('Ech image must be less than 5MB');
      }
    }

    // Upload images to Cloudinary
    const imageUrls = await this.cloudinaryService.uploadMultipleImages(files);

    // Create vehicle with image URLs
    const vehicleData = {
      ...createVehicleDto,
      images: imageUrls,
    };

    const vehicle = await this.vehicleService.create(vehicleData);

    return {
      message: 'Vehicle created successfully.',
      data: vehicle,
    };
  }

  /// ADMIN ONLY: Update vehicle
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
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

  // ADMIN ONLY: Toggle availability
  @Patch(':id/toggle-availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async toggleAvailability(@Param('id') id: string) {
    const vehicle = await this.vehicleService.toggleAvailability(id);

    return {
      message: `Vehicle ${vehicle.isAvailable ? 'enabled' : 'disabled'} successfully`,
      data: vehicle,
    };
  }

  // ADMIN ONLY: Delete vehicle (soft delete)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.vehicleService.remove(id);
  }
}

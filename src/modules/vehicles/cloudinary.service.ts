/* eslint-disable @typescript-eslint/no-unsafe-return */
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'fleetcord/vehicles',
          transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          if (error) return reject(error);
          resolve(result as UploadApiResponse);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]> {
    if (files.length > 3) {
      throw new BadRequestException('Maximum 3 images allowed');
    }

    if (files.length < 1) {
      throw new BadRequestException('At least 1 image is required');
    }

    const uploadPromises = files.map((file) => this.uploadImage(file));
    const results = await Promise.all(uploadPromises);

    return results.map((result) => result.secure_url);
  }

  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }

  extractPublicId(url: string): string {
    // Extract public_id from Cloudinary URL
    // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/fleetcord/vehicles/abc123.jpg
    // Returns: fleetcord/vehicles/abc123
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return '';

    const pathAfterUpload = parts.slice(uploadIndex + 2).join('/');
    return pathAfterUpload.replace(/\.[^/.]+$/, ''); // Remove file extension
  }
}

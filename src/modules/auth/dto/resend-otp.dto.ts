import { IsNotEmpty, IsUUID } from 'class-validator';

export class ResendOtpDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}

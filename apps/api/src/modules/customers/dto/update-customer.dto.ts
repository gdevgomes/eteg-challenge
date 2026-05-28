import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCustomerDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsUUID()
  colorId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

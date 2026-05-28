import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  fullName: string;

  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF must be in format 000.000.000-00',
  })
  cpf: string;

  @IsEmail()
  email: string;

  @IsUUID()
  colorId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

import { Color } from '../../../entities/color.entity';

export class CustomerResponseDto {
  id: string;
  fullName: string;
  cpfStart: string;
  cpfEnd: string;
  email: string;
  notes: string | null;
  color: Color;
  createdAt: Date;
  updatedAt: Date;
}

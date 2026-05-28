import { Matches } from 'class-validator';

export class LookupCustomerDto {
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF must be in format 000.000.000-00',
  })
  cpf: string;
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Customer } from '../../entities/customer.entity';

@Injectable()
export class CustomersRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
  ) {}

  findAll(pagination: PaginationDto): Promise<[Customer[], number]> {
    return this.repo.findAndCount({
      relations: { color: true },
      skip: pagination.skip,
      take: pagination.limit,
      order: { createdAt: 'DESC' },
    });
  }

  findByCpfHash(cpfHash: string): Promise<Customer | null> {
    return this.repo.findOne({ where: { cpfHash } });
  }

  findByEmail(email: string): Promise<Customer | null> {
    return this.repo.findOne({ where: { email } });
  }

  save(customer: Partial<Customer>): Promise<Customer> {
    return this.repo.save(this.repo.create(customer));
  }
}

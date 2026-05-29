import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Customer } from '../../entities/customer.entity';
import { FindCustomersDto } from './dto/find-customers.dto';

@Injectable()
export class CustomersRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
  ) {}

  findAll(query: FindCustomersDto): Promise<[Customer[], number]> {
    const name = query.name?.trim();
    return this.repo.findAndCount({
      where: name ? { fullName: ILike(`%${name}%`) } : {},
      relations: { color: true },
      skip: query.skip,
      take: query.limit,
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

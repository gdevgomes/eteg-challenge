import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { createHmac } from 'crypto';
import { Env } from '../../config/env';
import { Color } from '../../entities/color.entity';
import { Customer } from '../../entities/customer.entity';
import { CustomersRepository } from './customers.repository';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { LookupCustomerDto } from './dto/lookup-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    private readonly customersRepository: CustomersRepository,
    private readonly config: ConfigService<Env, true>,
    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(dto: CreateCustomerDto): Promise<CustomerResponseDto> {
    const digits = dto.cpf.replace(/\D/g, '');

    const cpfHash = createHmac('sha256', this.config.get('CPF_HASH_SECRET'))
      .update(digits)
      .digest('hex');

    const [cpfDuplicate, emailDuplicate] = await Promise.all([
      this.customersRepository.findByCpfHash(cpfHash),
      this.customersRepository.findByEmail(dto.email),
    ]);

    if (cpfDuplicate) throw new ConflictException('CPF already registered');
    if (emailDuplicate) throw new ConflictException('Email already registered');

    const cpfStart = digits.slice(0, 3);
    const cpfEnd = digits.slice(-2);

    const cached = await this.cacheManager.get<Color[]>('/colors');
    const color =
      cached?.find((c) => c.id === dto.colorId) ??
      (await this.colorRepository.findOne({ where: { id: dto.colorId } }));

    if (!color) throw new NotFoundException('Color not found');

    const customer = await this.customersRepository.save({
      fullName: dto.fullName,
      cpfStart,
      cpfEnd,
      cpfHash,
      email: dto.email,
      notes: dto.notes ?? null,
      color,
    });

    return this.toResponse(customer);
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<{ data: Customer[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.customersRepository.findAll(pagination);
    return { data, total, page: pagination.page, limit: pagination.limit };
  }

  async edit(
    cpf: string,
    dto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const digits = cpf.replace(/\D/g, '');
    const cpfHash = createHmac('sha256', this.config.get('CPF_HASH_SECRET'))
      .update(digits)
      .digest('hex');

    const customer = await this.customersRepository.findByCpfHash(cpfHash);
    if (!customer) throw new NotFoundException('Customer not found');

    if (/\*/.test(dto.fullName) || /\*/.test(dto.email)) {
      throw new BadRequestException('Masked data is not allowed');
    }

    const cached = await this.cacheManager.get<Color[]>('/colors');
    const color =
      cached?.find((c) => c.id === dto.colorId) ??
      (await this.colorRepository.findOne({ where: { id: dto.colorId } }));

    if (!color) throw new NotFoundException('Color not found');

    const updated = await this.customersRepository.save({
      ...customer,
      fullName: dto.fullName,
      email: dto.email,
      notes: dto.notes ?? null,
      color,
    });

    return this.toResponse(updated);
  }

  async findByCpf(dto: LookupCustomerDto): Promise<CustomerResponseDto> {
    const digits = dto.cpf.replace(/\D/g, '');
    const cpfHash = createHmac('sha256', this.config.get('CPF_HASH_SECRET'))
      .update(digits)
      .digest('hex');

    const customer = await this.customersRepository.findByCpfHash(cpfHash);
    if (!customer) throw new NotFoundException('Customer not found');

    return this.toResponse(customer);
  }

  private toResponse(customer: Customer): CustomerResponseDto {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { cpfHash: _, ...response } = customer;
    return response;
  }
}

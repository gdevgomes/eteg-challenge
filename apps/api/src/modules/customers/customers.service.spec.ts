import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { createHmac } from 'crypto';
import { CustomersService } from './customers.service';
import { CustomersRepository } from './customers.repository';
import { Color } from '../../entities/color.entity';
import { Customer } from '../../entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

const CPF_SECRET = 'test-secret';

const mockColor: Color = {
  id: 'color-uuid',
  name: 'Red',
  hex: '#FF0000',
  customers: [],
};

const makeCustomer = (overrides?: Partial<Customer>): Customer => ({
  id: 'customer-uuid',
  fullName: 'João Silva',
  cpfStart: '123',
  cpfEnd: '00',
  cpfHash: createHmac('sha256', CPF_SECRET).update('12345678900').digest('hex'),
  email: 'joao@example.com',
  notes: null,
  color: mockColor,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makePagination = (page = 1, limit = 20): PaginationDto =>
  Object.assign(new PaginationDto(), { page, limit });

describe('CustomersService', () => {
  let service: CustomersService;
  let customersRepo: jest.Mocked<CustomersRepository>;
  let colorRepo: jest.Mocked<Repository<Color>>;
  let cache: jest.Mocked<Cache>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: CustomersRepository,
          useValue: {
            findByCpfHash: jest.fn(),
            findByEmail: jest.fn(),
            findAll: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(CPF_SECRET) },
        },
        {
          provide: getRepositoryToken(Color),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(CustomersService);
    customersRepo = module.get(CustomersRepository);
    colorRepo = module.get(getRepositoryToken(Color));
    cache = module.get(CACHE_MANAGER);
  });

  describe('create', () => {
    const dto: CreateCustomerDto = {
      fullName: 'João Silva',
      cpf: '123.456.789-00',
      email: 'joao@example.com',
      colorId: 'color-uuid',
    };

    beforeEach(() => {
      customersRepo.findByCpfHash.mockResolvedValue(null);
      customersRepo.findByEmail.mockResolvedValue(null);
      cache.get.mockResolvedValue(null);
      colorRepo.findOne.mockResolvedValue(mockColor);
      customersRepo.save.mockResolvedValue(makeCustomer());
    });

    it('throws ConflictException when CPF is already registered', async () => {
      customersRepo.findByCpfHash.mockResolvedValue(makeCustomer());

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(
        'CPF already registered',
      );
    });

    it('throws ConflictException when email is already registered', async () => {
      customersRepo.findByEmail.mockResolvedValue(makeCustomer());

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(
        'Email already registered',
      );
    });

    it('throws NotFoundException when color does not exist', async () => {
      colorRepo.findOne.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('stores HMAC-SHA256 hash — not the raw CPF digits', async () => {
      customersRepo.save.mockImplementation(async (data) => ({
        ...makeCustomer(),
        ...data,
      }));

      await service.create(dto);

      const saved = customersRepo.save.mock.calls[0][0];
      expect(saved.cpfHash).not.toContain('12345678900');
      expect(saved.cpfHash).toHaveLength(64);
    });

    it('stores only first 3 and last 2 digits of CPF', async () => {
      customersRepo.save.mockImplementation(async (data) => ({
        ...makeCustomer(),
        ...data,
      }));

      await service.create(dto);

      const saved = customersRepo.save.mock.calls[0][0];
      expect(saved.cpfStart).toBe('123');
      expect(saved.cpfEnd).toBe('00');
    });

    it('does not expose cpfHash in the response', async () => {
      const result = await service.create(dto);

      expect(result).not.toHaveProperty('cpfHash');
    });

    it('uses cached colors without hitting the database', async () => {
      cache.get.mockResolvedValue([mockColor]);

      await service.create(dto);

      expect(colorRepo.findOne).not.toHaveBeenCalled();
    });

    it('falls back to database when cache misses', async () => {
      cache.get.mockResolvedValue(null);

      await service.create(dto);

      expect(colorRepo.findOne).toHaveBeenCalledWith({
        where: { id: dto.colorId },
      });
    });
  });

  describe('findAll', () => {
    it('returns data, total, page and limit', async () => {
      const customers = [makeCustomer()];
      customersRepo.findAll.mockResolvedValue([customers, 1]);

      const result = await service.findAll(makePagination(2, 10));

      expect(result).toEqual({ data: customers, total: 1, page: 2, limit: 10 });
    });
  });

  describe('edit', () => {
    const cpf = '123.456.789-00';
    const dto: UpdateCustomerDto = {
      fullName: 'João Santos',
      email: 'joao.santos@example.com',
      colorId: 'color-uuid',
    };

    beforeEach(() => {
      customersRepo.findByCpfHash.mockResolvedValue(makeCustomer());
      cache.get.mockResolvedValue([mockColor]);
      customersRepo.save.mockResolvedValue(
        makeCustomer({ fullName: dto.fullName }),
      );
    });

    it('throws NotFoundException when customer does not exist', async () => {
      customersRepo.findByCpfHash.mockResolvedValue(null);

      await expect(service.edit(cpf, dto)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when fullName contains masked asterisks', async () => {
      await expect(
        service.edit(cpf, { ...dto, fullName: 'J*** Silva' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when email contains masked asterisks', async () => {
      await expect(
        service.edit(cpf, { ...dto, email: 'j***@example.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when color does not exist', async () => {
      cache.get.mockResolvedValue(null);
      colorRepo.findOne.mockResolvedValue(null);

      await expect(service.edit(cpf, dto)).rejects.toThrow(NotFoundException);
    });

    it('falls back to database when cache misses', async () => {
      cache.get.mockResolvedValue(null);
      colorRepo.findOne.mockResolvedValue(mockColor);

      await service.edit(cpf, dto);

      expect(colorRepo.findOne).toHaveBeenCalledWith({
        where: { id: dto.colorId },
      });
    });

    it('does not expose cpfHash in the response', async () => {
      const result = await service.edit(cpf, dto);

      expect(result).not.toHaveProperty('cpfHash');
    });
  });

  describe('findByCpf', () => {
    it('throws NotFoundException when CPF is not registered', async () => {
      customersRepo.findByCpfHash.mockResolvedValue(null);

      await expect(
        service.findByCpf({ cpf: '000.000.000-00' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('does not expose cpfHash in the response', async () => {
      customersRepo.findByCpfHash.mockResolvedValue(makeCustomer());

      const result = await service.findByCpf({ cpf: '123.456.789-00' });

      expect(result).not.toHaveProperty('cpfHash');
    });

    it('looks up by HMAC hash of the provided CPF', async () => {
      customersRepo.findByCpfHash.mockResolvedValue(makeCustomer());

      await service.findByCpf({ cpf: '123.456.789-00' });

      const expectedHash = createHmac('sha256', CPF_SECRET)
        .update('12345678900')
        .digest('hex');
      expect(customersRepo.findByCpfHash).toHaveBeenCalledWith(expectedHash);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

describe('CustomersController', () => {
  let controller: CustomersController;
  let service: jest.Mocked<CustomersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
          useValue: {
            create: jest.fn(),
            findByCpf: jest.fn(),
            edit: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(CustomersController);
    service = module.get(CustomersService);
  });

  it('create delegates to service.create', () => {
    const dto: CreateCustomerDto = {
      fullName: 'Test User',
      cpf: '123.456.789-00',
      email: 'test@example.com',
      colorId: 'uuid',
    };

    controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findByCpf delegates to service.findByCpf', () => {
    const dto = { cpf: '123.456.789-00' };

    controller.findByCpf(dto);

    expect(service.findByCpf).toHaveBeenCalledWith(dto);
  });

  it('edit passes cpf and dto to service.edit', () => {
    const cpf = '123.456.789-00';
    const dto: UpdateCustomerDto = {
      fullName: 'Updated Name',
      email: 'updated@example.com',
      colorId: 'uuid',
    };

    controller.edit(cpf, dto);

    expect(service.edit).toHaveBeenCalledWith(cpf, dto);
  });

  it('findAll delegates pagination to service.findAll', () => {
    const pagination = Object.assign(new PaginationDto(), {
      page: 2,
      limit: 10,
    });

    controller.findAll(pagination);

    expect(service.findAll).toHaveBeenCalledWith(pagination);
  });
});

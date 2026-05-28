import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { ColorsController } from './colors.controller';
import { ColorsService } from './colors.service';
import { Color } from '../entities/color.entity';

const mockColors: Color[] = [
  { id: 'uuid-1', name: 'Red', hex: '#FF0000', customers: [] },
];

describe('ColorsController', () => {
  let controller: ColorsController;
  let service: jest.Mocked<ColorsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColorsController],
      providers: [
        {
          provide: ColorsService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(ColorsController);
    service = module.get(ColorsService);
  });

  it('findAll delegates to service.findAll', async () => {
    service.findAll.mockResolvedValue(mockColors);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockColors);
  });

  it('create delegates to service.create', () => {
    const dto = { name: 'Green', hex: '#00FF00' };

    controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('remove delegates to service.remove with the given id', () => {
    controller.remove('uuid-1');

    expect(service.remove).toHaveBeenCalledWith('uuid-1');
  });
});

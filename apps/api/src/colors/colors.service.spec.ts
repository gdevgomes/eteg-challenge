import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { ColorsService } from './colors.service';
import { ColorsRepository } from './colors.repository';
import { Color } from '../entities/color.entity';

const CACHE_KEY = '/colors';

const mockColors: Color[] = [
  { id: 'uuid-1', name: 'Red', hex: '#FF0000', customers: [] },
  { id: 'uuid-2', name: 'Blue', hex: '#0000FF', customers: [] },
];

describe('ColorsService', () => {
  let service: ColorsService;
  let repository: jest.Mocked<ColorsRepository>;
  let cache: jest.Mocked<Cache>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColorsService,
        {
          provide: ColorsRepository,
          useValue: {
            findAll: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(ColorsService);
    repository = module.get(ColorsRepository);
    cache = module.get(CACHE_MANAGER);
  });

  describe('findAll', () => {
    it('returns all colors from repository', async () => {
      repository.findAll.mockResolvedValue(mockColors);

      const result = await service.findAll();

      expect(result).toEqual(mockColors);
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });

    it('returns empty array when no colors are registered', async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    const dto = { name: 'Green', hex: '#00FF00' };

    it('saves the new color via repository', async () => {
      const saved = {
        id: 'uuid-3',
        name: dto.name,
        hex: dto.hex,
        customers: [],
      };
      repository.save.mockResolvedValue(saved);

      const result = await service.create(dto);

      expect(repository.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual(saved);
    });

    it('invalidates the cache after creating a color', async () => {
      repository.save.mockResolvedValue({
        id: 'uuid-3',
        ...dto,
        customers: [],
      });

      await service.create(dto);

      expect(cache.del).toHaveBeenCalledWith(CACHE_KEY);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when color does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('uuid-999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deletes the color via repository when it exists', async () => {
      repository.findById.mockResolvedValue(mockColors[0]);

      await service.remove('uuid-1');

      expect(repository.remove).toHaveBeenCalledWith(mockColors[0]);
    });

    it('invalidates the cache after removing a color', async () => {
      repository.findById.mockResolvedValue(mockColors[0]);

      await service.remove('uuid-1');

      expect(cache.del).toHaveBeenCalledWith(CACHE_KEY);
    });

    it('does not touch the cache when color is not found', async () => {
      repository.findById.mockResolvedValue(null);

      await service.remove('uuid-999').catch(() => null);

      expect(cache.del).not.toHaveBeenCalled();
    });
  });
});

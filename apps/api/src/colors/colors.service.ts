import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Color } from '../entities/color.entity';
import { ColorsRepository } from './colors.repository';
import { CreateColorDto } from './dto/create-color.dto';

const COLORS_CACHE_KEY = '/colors';

@Injectable()
export class ColorsService {
  constructor(
    private readonly colorsRepository: ColorsRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  findAll(): Promise<Color[]> {
    return this.colorsRepository.findAll();
  }

  async create(dto: CreateColorDto): Promise<Color> {
    const color = await this.colorsRepository.save(dto);
    await this.cacheManager.del(COLORS_CACHE_KEY);
    return color;
  }

  async remove(id: string): Promise<void> {
    const color = await this.colorsRepository.findById(id);
    if (!color) throw new NotFoundException('Color not found');
    await this.colorsRepository.remove(color);
    await this.cacheManager.del(COLORS_CACHE_KEY);
  }
}

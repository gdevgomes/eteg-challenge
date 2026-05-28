import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Color } from '../entities/color.entity';
import { CreateColorDto } from './dto/create-color.dto';

@Injectable()
export class ColorsRepository {
  constructor(
    @InjectRepository(Color)
    private readonly repo: Repository<Color>,
  ) {}

  findAll(): Promise<Color[]> {
    return this.repo.find();
  }

  findById(id: string): Promise<Color | null> {
    return this.repo.findOne({ where: { id } });
  }

  save(dto: CreateColorDto): Promise<Color> {
    return this.repo.save(this.repo.create(dto));
  }

  remove(color: Color): Promise<Color> {
    return this.repo.remove(color);
  }
}

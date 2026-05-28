import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Color } from '../entities/color.entity';
import { AuthModule } from '../modules/auth/auth.module';
import { ColorsService } from './colors.service';
import { ColorsController } from './colors.controller';
import { ColorsRepository } from './colors.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Color]), AuthModule],
  controllers: [ColorsController],
  providers: [ColorsService, ColorsRepository],
})
export class ColorsModule {}

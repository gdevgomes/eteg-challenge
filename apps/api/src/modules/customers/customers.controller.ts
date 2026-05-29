import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth/jwt-auth.guard';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { FindCustomersDto } from './dto/find-customers.dto';
import { LookupCustomerDto } from './dto/lookup-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Post('lookup')
  @HttpCode(HttpStatus.OK)
  findByCpf(@Body() dto: LookupCustomerDto) {
    return this.customersService.findByCpf(dto);
  }

  @Put()
  edit(@Body('cpf') cpf: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.edit(cpf, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: FindCustomersDto) {
    return this.customersService.findAll(query);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.customersService.findOne(id);
  // }
}

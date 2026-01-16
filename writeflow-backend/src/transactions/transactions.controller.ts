import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  findAll(@Query() filterDto: FilterTransactionDto, @Req() req) {
    // If user is not admin, filter by their own userId
    if (req.user.role !== Role.ADMIN) {
      filterDto.userId = req.user.id;
    }
    return this.transactionsService.findAll(filterDto);
  }

  @Get('my-transactions')
  getMyTransactions(@Query() filterDto: FilterTransactionDto, @Req() req) {
    filterDto.userId = req.user.id;
    return this.transactionsService.findAll(filterDto);
  }
}
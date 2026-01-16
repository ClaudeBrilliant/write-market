import { IsEnum, IsOptional, IsUUID, IsDateString, IsInt, Min } from 'class-validator';
import { TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';

export class FilterTransactionDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
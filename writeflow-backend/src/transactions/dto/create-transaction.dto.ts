import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
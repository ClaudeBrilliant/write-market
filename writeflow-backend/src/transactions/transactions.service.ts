import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const { userId, amount, type, description } = createTransactionDto;

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate new balance based on transaction type
    let newBalance = new Decimal(user.walletBalance.toString());
    const transactionAmount = new Decimal(amount.toString());

    switch (type) {
      case TransactionType.EARNING:
      case TransactionType.BONUS:
        newBalance = newBalance.add(transactionAmount);
        break;
      case TransactionType.WITHDRAWAL:
      case TransactionType.PENALTY:
        newBalance = newBalance.sub(transactionAmount);
        if (newBalance.lessThan(0)) {
          throw new BadRequestException('Insufficient balance');
        }
        break;
    }

    // Create transaction and update user balance in a transaction
    const transaction = await this.prisma.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          amount: transactionAmount,
          type,
          description,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              walletBalance: true,
            },
          },
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: newBalance },
      });

      return newTransaction;
    });

    return transaction;
  }

  async findAll(filterDto: FilterTransactionDto) {
    const { userId, type, startDate, endDate, page = 1, limit = 10 } = filterDto;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
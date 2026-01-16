import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountStatus, TaskStatus, TransactionType } from '@prisma/client';
import { StatisticsDto } from './dto/statistics';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStatistics(statisticsDto: StatisticsDto) {
    const { startDate, endDate } = statisticsDto;

    const dateFilter: any = {};
    if (startDate || endDate) {
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.lte = new Date(endDate);
      }
    }

    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      totalTasks,
      openTasks,
      completedTasks,
      totalTransactions,
      totalEarnings,
      totalWithdrawals,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: AccountStatus.ACTIVE } }),
      this.prisma.user.count({ where: { status: AccountStatus.PENDING } }),
      this.prisma.user.count({ where: { status: AccountStatus.SUSPENDED } }),
      this.prisma.task.count(
        Object.keys(dateFilter).length > 0
          ? { where: { createdAt: dateFilter } }
          : undefined,
      ),
      this.prisma.task.count({ where: { status: TaskStatus.OPEN } }),
      this.prisma.task.count({ where: { status: TaskStatus.COMPLETED } }),
      this.prisma.transaction.count(
        Object.keys(dateFilter).length > 0
          ? { where: { createdAt: dateFilter } }
          : undefined,
      ),
      this.prisma.transaction.aggregate({
        where: {
          type: TransactionType.EARNING,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          type: TransactionType.WITHDRAWAL,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        pending: pendingUsers,
        suspended: suspendedUsers,
      },
      tasks: {
        total: totalTasks,
        open: openTasks,
        completed: completedTasks,
      },
      transactions: {
        total: totalTransactions,
        totalEarnings: totalEarnings._sum.amount || 0,
        totalWithdrawals: totalWithdrawals._sum.amount || 0,
      },
    };
  }

  async getDashboardData() {
    const [recentTransactions, recentTasks, topWriters] = await Promise.all([
      this.prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
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
      }),
      this.prisma.task.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTo: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: { bids: true },
          },
        },
      }),
      this.prisma.user.findMany({
        where: { role: 'WRITER' },
        take: 10,
        orderBy: { walletBalance: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          walletBalance: true,
          _count: {
            select: {
              assignedTasks: true,
              submissions: true,
            },
          },
        },
      }),
    ]);

    return {
      recentTransactions,
      recentTasks,
      topWriters,
    };
  }

  async getAllUsers(status?: AccountStatus) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        walletBalance: true,
        createdAt: true,
        _count: {
          select: {
            assignedTasks: true,
            transactions: true,
            bids: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  async updateUserStatus(userId: string, status: AccountStatus) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        walletBalance: true,
      },
    });

    return updatedUser;
  }

  async getRevenueStatistics(statisticsDto: StatisticsDto) {
    const { startDate, endDate } = statisticsDto;

    const dateFilter: any = {};
    if (startDate || endDate) {
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.lte = new Date(endDate);
      }
    }

    const transactionStats = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : undefined,
      _sum: { amount: true },
      _count: true,
    });

    const formattedStats = transactionStats.reduce((acc, stat) => {
      acc[stat.type] = {
        total: stat._sum.amount || 0,
        count: stat._count,
      };
      return acc;
    }, {} as Record<string, any>);

    return formattedStats;
  }
}
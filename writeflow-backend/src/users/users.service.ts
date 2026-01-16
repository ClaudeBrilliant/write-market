/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Role, TaskStatus, BidStatus, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
// import { User } from './interface/user.interface';
import { User } from '@prisma/client';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';


@Injectable()
export class UsersService {
  // user:any
  constructor(private prismaservice: PrismaService) {}

  async create(data: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.prismaservice.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new ConflictException(
          `User with email ${data.email} already exists`,
        );
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      const user = await this.prismaservice.user.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: hashedPassword,
          role: data.role || Role.WRITER,
          isActive: true,
        },
      });

      console.log(`Created new user ${user.firstName} ${user.lastName} (ID: ${user.id})`);
      return user;
      
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create user: ${error.message}`,
      );
    }
  }

   // Get user profile (extended)
  async getProfile(userId: string) {
    const user = await this.prismaservice.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        isEmailVerified: true,
        walletBalance: true,
        
        // Profile fields
        phone: true,
        bio: true,
        skills: true,
        avatarUrl: true,
        
        // Preferences
        emailNotifications: true,
        smsNotifications: true,
        notificationLevel: true,
        bidNotifications: true,
        taskNotifications: true,
        paymentNotifications: true,
        marketingEmails: true,
        
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // Update user profile (extended)
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prismaservice.user.update({
      where: { id: userId },
      data: {
        firstName: updateProfileDto.firstName,
        lastName: updateProfileDto.lastName,
        phone: updateProfileDto.phone,
        bio: updateProfileDto.bio,
        location: updateProfileDto.location,
        website: updateProfileDto.website,
        linkedIn: updateProfileDto.linkedIn,
        education: updateProfileDto.education,
        skills: updateProfileDto.skills,
        timezone: updateProfileDto.timezone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        bio: true,
        location: true,
        website: true,
        linkedIn: true,
        education: true,
        skills: true,
        timezone: true,
      },
    });

    return {
      message: 'Profile updated successfully',
      user,
    };
  }

  // Change password
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    // Get user with password
    const user = await this.prismaservice.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.prismaservice.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      message: 'Password changed successfully',
    };
  }

  // // Update preferences
  // async updatePreferences(
  //   userId: string,
  //   updatePreferencesDto: UpdatePreferencesDto,
  // ) {
  //   const user = await this.prismaservice.user.update({
  //     where: { id: userId },
  //     data: {
  //       emailNotifications: updatePreferencesDto.emailNotifications,
  //       smsNotifications: updatePreferencesDto.smsNotifications,
  //       notificationLevel: updatePreferencesDto.notificationLevel,
  //       bidNotifications: updatePreferencesDto.bidNotifications,
  //       taskNotifications: updatePreferencesDto.taskNotifications,
  //       paymentNotifications: updatePreferencesDto.paymentNotifications,
  //       marketingEmails: updatePreferencesDto.marketingEmails,
  //     },
  //     select: {
  //       emailNotifications: true,
  //       smsNotifications: true,
  //       notificationLevel: true,
  //       bidNotifications: true,
  //       taskNotifications: true,
  //       paymentNotifications: true,
  //       marketingEmails: true,
  //     },
  //   });

  //   return {
  //     message: 'Preferences updated successfully',
  //     preferences: user,
  //   };
  // }

  // Upload avatar (placeholder - implement with file upload)
  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.prismaservice.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        avatarUrl: true,
      },
    });

    return {
      message: 'Avatar updated successfully',
      user,
    };
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.prismaservice.user.findMany({
        orderBy: { id: 'asc' },
      });
      return users; 
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve users', error);
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.prismaservice.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }

      return user; // ✅ ADDED - Must return the user
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  async findById(id: string) {
    return this.prismaservice.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    try {
      // Check if user exists
      const existingUser = await this.prismaservice.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      // Check for email conflicts if email is being updated
      if (data.email && data.email !== existingUser.email) {
        const emailConflict = await this.prismaservice.user.findUnique({
          where: { email: data.email },
        });

        if (emailConflict) {
          throw new ConflictException('Another user with this email exists');
        }
      }

      // Hash password if provided
      let hashedPassword: string | undefined;
      if (data.password) {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(data.password, saltRounds);
      }

      const updatedUser = await this.prismaservice.user.update({
        where: { id },
        data: {
          ...(data.firstName && { firstName: data.firstName }),
          ...(data.lastName && { lastName: data.lastName }),
          ...(data.email && { email: data.email }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(hashedPassword && { password: hashedPassword }),
          ...(data.role && { role: data.role }),
        },
      });

      return updatedUser; 
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

   // Soft delete: mark user as inactive
  async softDelete(id: string): Promise<User> {
    const user = await this.prismaservice.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    return this.prismaservice.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Hard delete: remove user from database
  async remove(id: string): Promise<{ message: string }> {
    const user = await this.prismaservice.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    await this.prismaservice.user.delete({ where: { id } });
    return { message: `User with id ${id} deleted successfully` };
  }

  // Get dashboard statistics for a user
  async getDashboardStats(userId: string) {
    const user = await this.prismaservice.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get active tasks (ASSIGNED or IN_PROGRESS)
    const activeTasksCount = await this.prismaservice.task.count({
      where: {
        assignedToId: userId,
        status: {
          in: [TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS],
        },
      },
    });

    // Get pending bids
    const pendingBidsCount = await this.prismaservice.bid.count({
      where: {
        userId: userId,
        status: BidStatus.PENDING,
      },
    });

    // Get completed tasks
    const completedTasksCount = await this.prismaservice.task.count({
      where: {
        assignedToId: userId,
        status: TaskStatus.COMPLETED,
      },
    });

    // Get earnings this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const earningsThisMonth = await this.prismaservice.transaction.aggregate({
      where: {
        userId: userId,
        type: TransactionType.EARNING,
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get total completed tasks count (for all time)
    const totalCompletedTasks = completedTasksCount;

    // Get wallet balance
    const walletBalance = user.walletBalance;

    return {
      activeTasks: activeTasksCount,
      pendingBids: pendingBidsCount,
      completedTasks: totalCompletedTasks,
      earningsThisMonth: earningsThisMonth._sum.amount || 0,
      walletBalance: walletBalance,
    };
  }

  
}
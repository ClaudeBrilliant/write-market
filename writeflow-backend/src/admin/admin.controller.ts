import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Query,
  Body,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Role, AccountStatus } from '@prisma/client';
import { StatisticsDto } from './dto/statistics';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('statistics')
  getStatistics(@Query() statisticsDto: StatisticsDto) {
    return this.adminService.getStatistics(statisticsDto);
  }

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboardData();
  }

  @Get('users')
  getAllUsers(@Query('status') status?: AccountStatus) {
    return this.adminService.getAllUsers(status);
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id') id: string,
    @Body('status') status: AccountStatus,
  ) {
    return this.adminService.updateUserStatus(id, status);
  }

  @Get('revenue')
  getRevenueStats(@Query() statisticsDto: StatisticsDto) {
    return this.adminService.getRevenueStatistics(statisticsDto);
  }
}
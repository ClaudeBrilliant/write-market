/* eslint-disable prettier/prettier */
import { Body, Controller, Get,Patch, Delete, Param, Post, Put ,Request} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiResponse } from './shared/ApiResponse/api-response.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private userservice: UsersService) {}

  @Post()
  async create(@Body() data: CreateUserDto): Promise<ApiResponse<Partial<User>>> {
    try {
      const user = await this.userservice.create(data);
      const { password, refreshToken, ...userWithoutPassword } = user;
      return {
        success: true,
        message: 'User created successfully',
        data: userWithoutPassword,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get profile
  @Get('profile')
  getProfile(@Request() req) {
    return this.userservice.getProfile(req.user.userId);
  }

  // Update profile
  @Put('profile')
  updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.userservice.updateProfile(req.user.userId, updateProfileDto);
  }

  // Change password
  @Post('change-password')
  changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.userservice.changePassword(req.user.userId, changePasswordDto);
  }

  @Get('dashboard')
  getDashboard(@Request() req) {
    return this.userservice.getDashboardStats(req.user.userId);
  }

  // // Update preferences
  // @Patch('preferences')
  // updatePreferences(
  //   @Request() req,
  //   @Body() updatePreferencesDto: UpdatePreferencesDto,
  // ) {
  //   return this.userservice.updatePreferences(
  //     req.user.userId,
  //     updatePreferencesDto,
  //   );
  // }

  // Upload avatar (implement file upload separately)
  @Post('avatar')
  updateAvatar(@Request() req, @Body('avatarUrl') avatarUrl: string) {
    return this.userservice.updateAvatar(req.user.userId, avatarUrl);
  }


  @Get()
  async findAll(): Promise<User[]> {
    return this.userservice.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userservice.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
  ): Promise<User> {
    // ✅ All logic is in the service - just call it with id and data
    return this.userservice.update(id, data);
  }

    @Patch(':id/soft-delete')
  async softDelete(@Param('id') id: string) {
    return this.userservice.softDelete(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userservice.remove(id);
  }
}
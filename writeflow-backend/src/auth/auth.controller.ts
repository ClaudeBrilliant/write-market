import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
} from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResendVerificationDto } from './dto/resend-verification-token.dto';
import { Throttle } from '@nestjs/throttler';


@Throttle({
  auth: {
    ttl: 60,
    limit: 5,
  },
})
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  @Public()
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Public()
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('resend-verification')
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendEmailVerification(dto.email);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout from account' })
  logout(@CurrentUser() user: any) {
    return this.authService.logout(user.userId);
  }

  @Get('test')
  @UseGuards(JwtAuthGuard)
  testAuth() {
    return {
      message: 'Authentication working!',
      timmestamp: new Date().toISOString,
    };
  }
}

/* eslint-disable prettier/prettier */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestPasswordResetDto } from './dto/reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AccountStatus, Role } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  private generateResetCode(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }

  async register(registerDto: RegisterDto) {
    const {
      email,
      password,
      firstName,
      lastName,
      role = Role.WRITER,
    } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    if (!password) {
      throw new BadRequestException('Password is required');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        status: AccountStatus.PENDING,
        isEmailVerified: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    const verificationToken = randomBytes(32).toString('hex');

    await this.prisma.emailVerification.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    try {
      await this.emailService.sendEmailVerificationEmail(
        user.email,
        user.firstName,
        verificationToken,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't throw - user is created, they can resend
    }

    return {
      message: 'Registration successful. Please verify your email.',
      user,
    };
  }

  async resendEmailVerification(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    const verificationToken = randomBytes(32).toString('hex');

    // Delete old token if exists
    await this.prisma.emailVerification.deleteMany({
      where: { userId: user.id },
    });

    await this.prisma.emailVerification.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
      },
    });

    await this.emailService.sendEmailVerificationEmail(
      user.email,
      user.firstName,
      verificationToken,
    );

    return { message: 'Verification email resent' };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Uncomment these when you want to enforce email verification
    // if (user.status !== AccountStatus.ACTIVE) {
    //   throw new ForbiddenException(
    //     `Account is ${user.status.toLowerCase()}. Please contact support.`,
    //   );
    // }

    // if (!user.isEmailVerified) {
    //   throw new ForbiddenException(
    //     'Please verify your email before logging in',
    //   );
    // }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Fixed: Pass user.role directly (it's already a Role enum from Prisma)
    const token = await this.generateToken(user.id, user.email, user.role);

    // Update refresh token
    const hashedRefreshToken = await bcrypt.hash(token.refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        walletBalance: user.walletBalance,
      },
      token,
      message: 'Login successful',
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateToken(user.id, user.email, user.role);

    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { message: 'Logged out successfully' };
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    console.log('Password reset requested for email:', dto.email);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      console.log('User not found for email:', dto.email);
      // Don't reveal if user exists or not for security
      return {
        message: 'If an account exists, a reset code has been sent.',
      };
    }

    console.log('User found:', {
      id: user.id,
      firstName: user.firstName,
      email: user.email,
    });

    const code = this.generateResetCode();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    console.log('Generated reset code:', code);
    console.log('Expires at:', expiresAt);

    await this.prisma.passwordReset.create({
      data: {
        email: dto.email,
        code,
        expiresAt,
        userId: user.id,
      },
    });

    console.log('Password reset record created in database');

    try {
      console.log('Calling email service...');
      await this.emailService.sendPasswordResetEmail(
        dto.email,
        user.firstName,
        code.toString(),
      );
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Don't throw - reset code is created, user can try again
    }

    return {
      message: 'If an account exists, a reset code has been sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { code, newPassword } = dto;

    const resetRecord = await this.prisma.passwordReset.findFirst({
      where: {
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetRecord) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { email: resetRecord.email },
      data: { password: hashedPassword },
    });

    await this.prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true },
    });

    return { message: 'Password reset successful' };
  }

  private async generateToken(userId: string, email: string, role: Role) {
    const payload = { 
      sub: userId, 
      email, 
      role: role.toString() // Convert enum to string for JWT
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN') || '1d',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // ✅ Import JwtModule
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    UsersModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') || 'fallback-secret-key',
        signOptions: {
          expiresIn: '7d' as const, // Explicit constant
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService,
    JwtStrategy,       
    JwtModule,      
  ],
})
export class AuthModule {}

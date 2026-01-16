import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { TasksModule } from './tasks/tasks.module';
import { BidsModule } from './bids/bids.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AdminModule } from './admin/admin.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    AuthModule,
    UsersModule,
    PrismaModule,
    EmailModule,
    CloudinaryModule,
    TasksModule,
    BidsModule,
    SubmissionsModule,
    TransactionsModule,
    AdminModule,
    ThrottlerModule.forRoot({
      throttlers: [
         {
      name: 'default',
      ttl: 60,
      limit: 20,
    },
    {
      name: 'auth',
      ttl: 60,
      limit: 5,
    },
      ],
    }),
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService, CloudinaryService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

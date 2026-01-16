/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../prisma/prisma.service';
import { AccountStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/client';

@Injectable()
export class EmailService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
  ) {}


  // When a writer registers
  async sendWriterWelcomeEmail(email: string, firstName: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to WriteFlow 🎉',
      template: 'welcome',
      context: {
        firstName,
      },
    });
  }

  //send email verification
  async sendEmailVerificationEmail(
  email: string,
  firstName: string,
  token: string,
) {
  await this.mailerService.sendMail({
    to: email,
    subject: 'Confirm your email address',
    template: 'verify-email',
    context: {
      firstName,
      verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${token}`,
    },
  });
}


async verifyEmail(token: string) {
  const record = await this.prisma.emailVerification.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record || record.used)
    throw new BadRequestException('Invalid verification token');

  if (record.expiresAt < new Date())
    throw new BadRequestException('Verification token expired');

  await this.prisma.$transaction([
    this.prisma.user.update({
      where: { id: record.userId },
      data: {
        isEmailVerified: true,
        status: AccountStatus.ACTIVE,
      },
    }),
    this.prisma.emailVerification.update({
      where: { id: record.id },
      data: { used: true },
    }),
  ]);

  return { message: 'Email verified successfully' };
}

  // When a new task is published
  async notifyWritersNewTask(task: {
    id: string;
    title: string;
    budget: number;
    deadline: Date;
  }) {
    const writers = await this.prisma.user.findMany({
      where: {
        role: 'WRITER',
        isActive: true,
      },
      select: { email: true, firstName: true },
    });

    await Promise.all(
      writers.map(writer =>
        this.mailerService.sendMail({
          to: writer.email,
          subject: 'New Writing Task Available ✍️',
          template: 'new-task',
          context: {
            name: writer.firstName,
            task,
          },
        }),
      ),
    );
  }

  // When writer places a bid
  async notifyAdminNewBid(bid: {
    id: string;
    amount: Decimal;
    taskTitle: string;
    writerName: string;
  }) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { email: true, firstName: true },
    });

    await Promise.all(
      admins.map(admin =>
        this.mailerService.sendMail({
          to: admin.email,
          subject: 'New Bid Submitted',
          template: 'admin-new-bids',
          context: {
            adminName: admin.firstName,
            bid,
          },
        }),
      ),
    );
  }

  // When admin approves a bid
  async sendBidApprovedEmail(
    writerEmail: string,
    writerName: string,
    taskTitle: string,
  ) {
    await this.mailerService.sendMail({
      to: writerEmail,
      subject: 'Your Bid Has Been Approved ✅',
      template: 'bid-approved',
      context: {
        writerName,
        taskTitle,
      },
    });
  }

  // When admin rejects a bid
  async sendBidRejectedEmail(
    writerEmail: string,
    writerName: string,
    taskTitle: string,
  ) {
    await this.mailerService.sendMail({
      to: writerEmail,
      subject: 'Bid Update',
      template: 'bid-rejected',
      context: {
        writerName,
        taskTitle,
      },
    });
  }


  // When writer submits work
  async notifyAdminSubmission(submission: {
    taskTitle: string;
    writerName: string;
    submittedAt: Date;
  }) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { email: true, firstName: true },
    });

    await Promise.all(
      admins.map(admin =>
        this.mailerService.sendMail({
          to: admin.email,
          subject: 'New Task Submission 📄',
          template: 'admin-submission',
          context: {
            adminName: admin.firstName,
            submission,
          },
        }),
      ),
    );
  }

  // When admin accepts submission
  async sendSubmissionApprovedEmail(
    writerEmail: string,
    writerName: string,
    taskTitle: string,
  ) {
    await this.mailerService.sendMail({
      to: writerEmail,
      subject: 'Submission Approved 🎉',
      template: 'submission-approved',
      context: {
        writerName,
        taskTitle,
      },
    });
  }


  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetCode: string,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Your Password',
      template: 'password-reset',
      context: {
        firstName,
        code: resetCode,
      },
    });
  }

  async notifyAccountActivated(email: string, firstName: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Your Account Has Been Activated ',
      template: 'account-activated',
      context: {
        firstName,
      },
    });
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { BidStatus, TaskStatus } from '@prisma/client';
import { EmailService } from '../email/email.service';

@Injectable()
export class BidsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(userId: string, createBidDto: CreateBidDto) {
    const { taskId, amount, proposal } = createBidDto;

    // Check if task exists and is open
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.status !== TaskStatus.OPEN) {
      throw new ForbiddenException('Task is not open for bidding');
    }

    // Check if user already bid on this task
    const existingBid = await this.prisma.bid.findUnique({
      where: {
        taskId_userId: {
          taskId,
          userId,
        },
      },
    });

    if (existingBid) {
      throw new ConflictException('You have already placed a bid on this task');
    }

    // Create the bid with user info
    const bid = await this.prisma.bid.create({
      data: {
        taskId,
        userId,
        amount,
        proposal,
      },
      include: {
        task: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // 📧 Send email notification to admin about new bid
    try {
      await this.emailService.notifyAdminNewBid({
        id: bid.id,
        amount: bid.amount,
        taskTitle: task.title,
        writerName: `${bid.user.firstName} ${bid.user.lastName}`,
      });
      console.log('✅ Admin notified about new bid');
    } catch (error) {
      console.error('❌ Failed to notify admin about new bid:', error);
      // Don't throw - bid is created, email failure shouldn't stop the process
    }

    return bid;
  }

  async findUserBids(userId: string) {
    return this.prisma.bid.findMany({
      where: { userId },
      include: {
        task: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTaskBids(taskId: string) {
    return this.prisma.bid.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveBid(bidId: string, taskOwnerId: string) {
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
      include: { 
        task: true,
        user: true,
      },
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    if (bid.task.status !== TaskStatus.OPEN) {
      throw new ForbiddenException('Task is not open for bidding');
    }

    // Use transaction to update bid and task atomically
    const result = await this.prisma.$transaction(async (tx) => {
      // Update the approved bid
      const approvedBid = await tx.bid.update({
        where: { id: bidId },
        data: { status: BidStatus.APPROVED },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          task: true,
        },
      });

      // Update task status and assign writer
      await tx.task.update({
        where: { id: bid.taskId },
        data: {
          status: TaskStatus.ASSIGNED,
          assignedToId: bid.userId,
        },
      });

      // Reject all other bids for this task
      await tx.bid.updateMany({
        where: {
          taskId: bid.taskId,
          id: { not: bidId },
          status: BidStatus.PENDING,
        },
        data: { status: BidStatus.REJECTED },
      });

      return approvedBid;
    });

    // 📧 Send approval email to the winning bidder
    try {
      await this.emailService.sendBidApprovedEmail(
        result.user.email,
        result.user.firstName,
        result.task.title,
      );
      console.log('✅ Bid approval email sent to:', result.user.email);
    } catch (error) {
      console.error('❌ Failed to send bid approval email:', error);
    }

    // 📧 Send rejection emails to other bidders
    try {
      await this.sendRejectionEmailsForTask(bid.taskId, bidId);
    } catch (error) {
      console.error('❌ Failed to send rejection emails:', error);
    }

    return result;
  }

  async rejectBid(bidId: string, taskOwnerId: string) {
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
      include: { 
        task: true,
        user: true,
      },
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    if (bid.status !== BidStatus.PENDING) {
      throw new ForbiddenException('Only pending bids can be rejected');
    }

    const result = await this.prisma.bid.update({
      where: { id: bidId },
      data: { status: BidStatus.REJECTED },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        task: true,
      },
    });

    // 📧 Send rejection email to the bidder
    try {
      await this.emailService.sendBidRejectedEmail(
        result.user.email,
        result.user.firstName,
        result.task.title,
      );
      console.log('✅ Bid rejection email sent to:', result.user.email);
    } catch (error) {
      console.error('❌ Failed to send bid rejection email:', error);
    }

    return result;
  }

  async withdrawBid(bidId: string, userId: string) {
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
      include: { 
        task: true,
        user: true,
      },
    });

    if (!bid) {
      throw new NotFoundException('Bid not found');
    }

    // Verify that the user withdrawing is the bid owner
    if (bid.userId !== userId) {
      throw new ForbiddenException('You can only withdraw your own bids');
    }

    if (bid.status !== BidStatus.PENDING) {
      throw new ForbiddenException('Only pending bids can be withdrawn');
    }

    const result = await this.prisma.bid.delete({
      where: { id: bidId },
    });

    // 📧 Optional: Send confirmation email to writer about withdrawal
    try {
      // You can create a new email template for this if needed
      console.log('✅ Bid withdrawn by user:', bid.user.email);
      // await this.emailService.sendBidWithdrawnEmail(...);
    } catch (error) {
      console.error('❌ Failed to send withdrawal confirmation:', error);
    }

    return {
      message: 'Bid withdrawn successfully',
      bid: result,
    };
  }

  // 📧 Helper method to send rejection emails to other bidders
  private async sendRejectionEmailsForTask(
    taskId: string,
    approvedBidId: string,
  ) {
    // Get all rejected bids for this task (ones that were just auto-rejected)
    const rejectedBids = await this.prisma.bid.findMany({
      where: {
        taskId,
        id: { not: approvedBidId },
        status: BidStatus.REJECTED,
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
          },
        },
        task: {
          select: {
            title: true,
          },
        },
      },
    });

    console.log(`📧 Sending rejection emails to ${rejectedBids.length} bidders...`);

    // Send rejection emails to all rejected bidders in parallel
    const emailPromises = rejectedBids.map((bid) =>
      this.emailService
        .sendBidRejectedEmail(
          bid.user.email,
          bid.user.firstName,
          bid.task.title,
        )
        .catch((error) => {
          console.error(
            `Failed to send rejection email to ${bid.user.email}:`,
            error,
          );
          // Don't throw, continue with other emails
        }),
    );

    // Wait for all emails to complete (or fail)
    await Promise.allSettled(emailPromises);
    
    console.log(`✅ Finished sending ${rejectedBids.length} rejection emails`);
  }
}
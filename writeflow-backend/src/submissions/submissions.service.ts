import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@Injectable()
export class SubmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /* ================= WRITER ================= */

  async createSubmission(userId: string, dto: CreateSubmissionDto) {
    return this.prisma.submission.create({
      data: {
        taskId: dto.taskId,
        fileUrl: dto.fileUrl,
        notes: dto.notes,
        userId,
      },
    });
  }

  async getMySubmissions(userId: string) {
    return this.prisma.submission.findMany({
      where: { userId },
      include: { task: true },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async deleteSubmission(id: string, userId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.userId !== userId) {
      throw new ForbiddenException('You can only delete your own submission');
    }

    return this.prisma.submission.delete({
      where: { id },
    });
  }

  /* ================= ADMIN ================= */

  async getAllSubmissions() {
    return this.prisma.submission.findMany({
      include: {
        user: true,
        task: true,
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async getSubmissionById(id: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: { user: true, task: true },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return submission;
  }

  async getSubmissionsByTask(taskId: string) {
    return this.prisma.submission.findMany({
      where: { taskId },
      include: { user: true },
    });
  }

  async reviewSubmission(id: string, isApproved: boolean) {
    return this.prisma.submission.update({
      where: { id },
      data: {
        isApproved,
        reviewedAt: new Date(),
      },
    });
  }
}

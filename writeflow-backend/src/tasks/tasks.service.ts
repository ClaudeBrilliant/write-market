import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        ...createTaskDto,
        deadline: new Date(createTaskDto.deadline),
      },
    });

    return task;
  }

  async findAll(status?: TaskStatus) {
    return this.prisma.task.findMany({
      where: status ? { status } : {},
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName:true,
            email: true,
          },
        },
        _count: {
          select: {
            bids: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAvailable() {
    return this.prisma.task.findMany({
      where: {
        status: TaskStatus.OPEN,
        deadline: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName:true,
            lastName:true,
            email: true,
          },
        },
        bids: {
          include: {
            user: {
              select: {
                id: true,
                firstName:true,
                lastName:true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    await this.findOne(id);

    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  async assignTask(taskId: string, writerId: string) {
    const task = await this.findOne(taskId);

    if (task.status !== TaskStatus.OPEN) {
      throw new ForbiddenException('Task is not available for assignment');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        assignedToId: writerId,
        status: TaskStatus.ASSIGNED,
      },
    });
  }

  async completeTask(taskId: string) {
    return this.prisma.task.update({
      where: { id: taskId },
      data: { status: TaskStatus.COMPLETED },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.task.delete({ where: { id } });
  }
}
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Submissions')
@ApiBearerAuth()
@Controller('submissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  /* ============== WRITER ============== */

  @Post()
  @Roles(Role.WRITER)
  @ApiOperation({ summary: 'Submit completed work' })
  create(@Req() req, @Body() dto: CreateSubmissionDto) {
    return this.submissionsService.createSubmission(
      req.user.userId,
      dto,
    );
  }

  @Get('my-submissions')
  @Roles(Role.WRITER)
  @ApiOperation({ summary: 'Get my submissions' })
  getMine(@Req() req) {
    return this.submissionsService.getMySubmissions(req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.WRITER)
  @ApiOperation({ summary: 'Delete my submission' })
  delete(@Param('id') id: string, @Req() req) {
    return this.submissionsService.deleteSubmission(
      id,
      req.user.userId,
    );
  }

  /* ============== ADMIN ============== */

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all submissions' })
  getAll() {
    return this.submissionsService.getAllSubmissions();
  }

  @Get('task/:taskId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get submissions for a task' })
  getByTask(@Param('taskId') taskId: string) {
    return this.submissionsService.getSubmissionsByTask(taskId);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get submission by ID' })
  getOne(@Param('id') id: string) {
    return this.submissionsService.getSubmissionById(id);
  }

  @Patch(':id/review')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Approve or reject submission' })
  review(
    @Param('id') id: string,
    @Body('isApproved') isApproved: boolean,
  ) {
    return this.submissionsService.reviewSubmission(id, isApproved);
  }
}

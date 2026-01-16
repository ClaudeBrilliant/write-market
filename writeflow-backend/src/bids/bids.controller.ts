import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('bids')
@UseGuards(JwtAuthGuard) // All routes require authentication
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  @Roles(Role.WRITER,Role.ADMIN) 
  @UseGuards(RolesGuard)
  create(@Body() createBidDto: CreateBidDto, @Request() req) {
    // Pass userId from authenticated user FIRST
    return this.bidsService.create(req.user.userId, createBidDto);
  }

  @Get('my-bids')
  @Roles(Role.WRITER)
  @UseGuards(RolesGuard)
  getMyBids(@Request() req) {
    return this.bidsService.findUserBids(req.user.userId);
  }

  @Get('task/:taskId')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  getTaskBids(@Param('taskId') taskId: string) {
    return this.bidsService.findTaskBids(taskId);
  }

  @Patch(':id/approve')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  approveBid(@Param('id') id: string, @Request() req) {
    return this.bidsService.approveBid(id, req.user.userId);
  }

  @Patch(':id/reject')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  rejectBid(@Param('id') id: string, @Request() req) {
    return this.bidsService.rejectBid(id, req.user.userId);
  }

  @Delete(':id')
  @Roles(Role.WRITER)
  @UseGuards(RolesGuard)
  withdrawBid(@Param('id') id: string, @Request() req) {
    return this.bidsService.withdrawBid(id, req.user.userId);
  }
}
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('schedule')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schedule')
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Get()
  @ApiOperation({ summary: 'Get schedule for a specific date' })
  @ApiQuery({ name: 'date', example: '2026-06-24', description: 'Date in format YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: 'List of lessons scheduled for the date' })
  @ApiResponse({ status: 400, description: 'Invalid date parameter' })
  async getSchedule(@Query('date') date: string) {
    return this.scheduleService.getSchedule(date);
  }
}

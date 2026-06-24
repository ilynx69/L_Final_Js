import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JournalService } from './journal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('journal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('journal')
export class JournalController {
  constructor(private journalService: JournalService) {}

  @Get()
  @ApiOperation({ summary: 'Get journal matrix (students and grades) for a group and subject' })
  @ApiQuery({ name: 'groupId', example: 'group-uuid', description: 'Group ID' })
  @ApiQuery({ name: 'subjectId', example: 'subject-uuid', description: 'Subject ID' })
  @ApiResponse({ status: 200, description: 'Journal matrix' })
  @ApiResponse({ status: 400, description: 'Missing or invalid parameters' })
  async getJournal(
    @Query('groupId') groupId: string,
    @Query('subjectId') subjectId: string,
  ) {
    return this.journalService.getJournal(groupId, subjectId);
  }

  @Get('groups')
  @ApiOperation({ summary: 'Get all groups' })
  @ApiResponse({ status: 200, description: 'List of groups' })
  async getGroups() {
    return this.journalService.getGroups();
  }

  @Get('subjects')
  @ApiOperation({ summary: 'Get all subjects' })
  @ApiResponse({ status: 200, description: 'List of subjects' })
  async getSubjects() {
    return this.journalService.getSubjects();
  }
}

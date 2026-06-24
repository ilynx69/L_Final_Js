import { Controller, Get, Post, Body, Param, Query, Req, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LabsService } from './labs.service';
import { SubmitLabDto } from './dto/submit-lab.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import * as express from 'express';

@ApiTags('labs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('labs')
export class LabsController {
  constructor(private labsService: LabsService) {}

  @Get('assignment/:id')
  @ApiOperation({ summary: 'Get details of a lab assignment' })
  @ApiResponse({ status: 200, description: 'Lab assignment details' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  async getAssignment(@Param('id') id: string) {
    return this.labsService.getAssignment(id);
  }

  @Post('submit')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Submit solution for a lab assignment (Student only)' })
  @ApiResponse({ status: 201, description: 'Lab solution successfully submitted' })
  @ApiResponse({ status: 400, description: 'Invalid payload' })
  async submitLab(@Body() submitLabDto: SubmitLabDto, @Req() req: express.Request) {
    const student: any = req.user;
    return this.labsService.submitLab(student.id, submitLabDto);
  }

  @Get('submissions')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Get all submissions for an assignment (Teacher only)' })
  @ApiQuery({ name: 'labAssignmentId', example: 'assignment-uuid', description: 'Lab Assignment ID' })
  @ApiResponse({ status: 200, description: 'List of submissions' })
  async getSubmissions(@Query('labAssignmentId') labAssignmentId: string) {
    return this.labsService.getSubmissions(labAssignmentId);
  }

  @Post('submissions/:id/grade')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Grade a submitted lab solution (Teacher only)' })
  @ApiResponse({ status: 200, description: 'Solution graded successfully' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  async gradeSubmission(
    @Param('id') id: string,
    @Body() gradeSubmissionDto: GradeSubmissionDto,
    @Req() req: express.Request,
  ) {
    const teacher: any = req.user;
    return this.labsService.gradeSubmission(
      teacher.id,
      id,
      gradeSubmissionDto.grade,
      gradeSubmissionDto.comment,
    );
  }

  @Post('teams')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Create a project team for a team lab (Student only)' })
  @ApiResponse({ status: 201, description: 'Team successfully created' })
  async createTeam(@Body() createTeamDto: CreateTeamDto, @Req() req: express.Request) {
    const student: any = req.user;
    return this.labsService.createTeam(student.id, createTeamDto);
  }

  @Post('teams/:id/members')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Add a student member to your team (Student only)' })
  @ApiResponse({ status: 201, description: 'Member successfully added' })
  async addTeamMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
    @Req() req: express.Request,
  ) {
    const student: any = req.user;
    return this.labsService.addTeamMember(student.id, id, addMemberDto.userId);
  }
}

import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { PostGradeDto } from './dto/post-grade.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import * as express from 'express';

@ApiTags('lessons & grades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Post('lessons')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Create a new lesson (Teacher only)' })
  @ApiResponse({ status: 201, description: 'Lesson successfully created' })
  async createLesson(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.createLesson(createLessonDto);
  }

  @Post('grades')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Submit or update a grade for a student (Teacher only)' })
  @ApiResponse({ status: 201, description: 'Grade successfully submitted/updated' })
  async postGrade(@Body() postGradeDto: PostGradeDto, @Req() req: express.Request) {
    const teacher: any = req.user;
    return this.lessonsService.createOrUpdateGrade(teacher.id, postGradeDto);
  }
}

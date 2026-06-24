import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarkType, WorkType } from '@prisma/client';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async createLesson(data: {
    subjectId: string;
    groupId: string;
    date: string;
    startTime: string;
    endTime: string;
  }) {
    return this.prisma.lesson.create({
      data: {
        subjectId: data.subjectId,
        groupId: data.groupId,
        date: new Date(data.date),
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
      },
    });
  }

  async createOrUpdateGrade(
    teacherId: string,
    data: {
      studentId: string;
      lessonId: string;
      value?: number | null;
      markType: MarkType;
      type: WorkType;
      comment?: string;
    },
  ) {

    const student = await this.prisma.user.findUnique({
      where: { id: data.studentId },
    });
    if (!student) {
      throw new BadRequestException('Студент не найден');
    }
    if (student.status === 'EXPELLED') {
      throw new BadRequestException('Невозможно выставить оценку отчисленному студенту');
    }

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: data.lessonId },
    });
    if (!lesson) {
      throw new BadRequestException('Урок не найден');
    }

    let finalMarkType = data.markType;
    let finalValue = data.value;

    if (finalMarkType === MarkType.DELAY) {
      if (finalValue !== null && finalValue !== undefined) {
        if (finalValue > 20) {
          finalMarkType = MarkType.ABSENCE;
          finalValue = null;
        } else if (finalValue < 1) {
          finalValue = 1;
        }
      } else {
        finalValue = 10;
      }
    } else if (finalMarkType === MarkType.PRESENCE) {
      const now = new Date();
      const lessonStart = new Date(lesson.startTime);
      const diffMs = now.getTime() - lessonStart.getTime();
      if (diffMs > 0) {
        const diffMinutes = Math.floor(diffMs / 60000);
        if (diffMinutes > 20) {
          finalMarkType = MarkType.ABSENCE;
          finalValue = null;
        } else if (diffMinutes >= 1) {
          finalMarkType = MarkType.DELAY;
          finalValue = diffMinutes;
        }
      }
    }

    return this.prisma.grade.upsert({
      where: {
        studentId_lessonId: {
          studentId: data.studentId,
          lessonId: data.lessonId,
        },
      },
      update: {
        value: finalValue,
        markType: finalMarkType,
        type: data.type,
        comment: data.comment,
        createdById: teacherId,
      },
      create: {
        studentId: data.studentId,
        lessonId: data.lessonId,
        value: finalValue,
        markType: finalMarkType,
        type: data.type,
        comment: data.comment,
        createdById: teacherId,
      },
    });
  }
}

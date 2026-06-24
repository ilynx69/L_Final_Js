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
    if (finalMarkType === MarkType.PRESENCE) {
      const now = new Date();
      const fifteenMinutes = 15 * 60 * 1000;
      const lessonStart = new Date(lesson.startTime);
      if (now.getTime() > lessonStart.getTime() + fifteenMinutes) {
        finalMarkType = MarkType.DELAY;
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
        value: data.value,
        markType: finalMarkType,
        type: data.type,
        comment: data.comment,
        createdById: teacherId,
      },
      create: {
        studentId: data.studentId,
        lessonId: data.lessonId,
        value: data.value,
        markType: finalMarkType,
        type: data.type,
        comment: data.comment,
        createdById: teacherId,
      },
    });
  }
}

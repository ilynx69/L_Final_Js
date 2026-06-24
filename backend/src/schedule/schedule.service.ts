import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async getSchedule(dateStr: string) {
    if (!dateStr) {
      throw new BadRequestException('Параметр date обязателен');
    }

    const queryDate = new Date(dateStr);
    if (isNaN(queryDate.getTime())) {
      throw new BadRequestException('Неверный формат даты YYYY-MM-DD');
    }

    // Query lessons for the specified date
    const lessons = await this.prisma.lesson.findMany({
      where: {
        date: queryDate,
      },
      include: {
        subject: {
          include: {
            teachers: true,
          },
        },
        group: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Map to required API response format
    return lessons.map((lesson) => {
      // Find teachers names
      const teachersList = lesson.subject.teachers.map(
        (teacher) => `${teacher.lastName} ${teacher.firstName.charAt(0)}.${teacher.middleName ? teacher.middleName.charAt(0) + '.' : ''}`
      );
      const teacherName = teachersList.length > 0 ? teachersList.join(', ') : 'Не указан';

      return {
        id: lesson.id,
        subjectName: lesson.subject.name,
        groupName: lesson.group.name,
        startTime: lesson.startTime.toISOString(),
        endTime: lesson.endTime.toISOString(),
        teacherName,
      };
    });
  }
}

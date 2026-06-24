import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JournalService {
  constructor(private prisma: PrismaService) {}

  async getJournal(groupId: string, subjectId: string) {
    if (!groupId || !subjectId) {
      throw new BadRequestException('Параметры groupId и subjectId обязательны');
    }

    const lessons = await this.prisma.lesson.findMany({
      where: {
        groupId,
        subjectId,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const userToGroups = await this.prisma.userToGroup.findMany({
      where: {
        groupId,
      },
      include: {
        user: {
          include: {
            gradesReceived: {
              where: {
                lesson: {
                  subjectId,
                  groupId,
                },
              },
            },
          },
        },
      },
    });

    const studentsList = userToGroups
      .map((utg) => utg.user)
      .filter((user) => user.role === 'STUDENT');

    const formattedLessons = lessons.map((lesson) => ({
      id: lesson.id,
      date: lesson.date.toISOString().split('T')[0],
      startTime: lesson.startTime.toISOString(),
      endTime: lesson.endTime.toISOString(),
    }));

    const formattedStudents = studentsList.map((student) => {
      const gradesMap: Record<string, any> = {};

      student.gradesReceived.forEach((grade) => {
        gradesMap[grade.lessonId] = {
          id: grade.id,
          value: grade.value,
          markType: grade.markType,
          type: grade.type,
          comment: grade.comment,
        };
      });

      lessons.forEach((lesson) => {
        if (!gradesMap[lesson.id]) {
          gradesMap[lesson.id] = null;
        }
      });

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const isNew = student.createdAt.getTime() > threeDaysAgo.getTime();

      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        middleName: student.middleName,
        status: student.status,
        isNew,
        grades: gradesMap,
      };
    });

    return {
      lessons: formattedLessons,
      students: formattedStudents,
    };
  }

  async getGroups() {
    return this.prisma.group.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getSubjects() {
    return this.prisma.subject.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}

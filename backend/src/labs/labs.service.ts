import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmissionStatus } from '@prisma/client';

@Injectable()
export class LabsService {
  constructor(private prisma: PrismaService) {}

  async getAssignment(id: string, userId?: string) {
    const assignment = await this.prisma.labAssignment.findUnique({
      where: { id },
      include: {
        subject: true,
      },
    });
    if (!assignment) {
      throw new NotFoundException('Лабораторная работа не найдена');
    }

    let submission: any = null;
    if (userId) {
      if (assignment.isTeam) {

        const teamMember = await this.prisma.teamMember.findFirst({
          where: {
            userId: userId,
            team: {
              labAssignmentId: id,
            },
          },
        });

        if (teamMember) {
          submission = await this.prisma.labSubmission.findFirst({
            where: {
              labAssignmentId: id,
              teamId: teamMember.teamId,
            },
          });
        }
      } else {
        submission = await this.prisma.labSubmission.findFirst({
          where: {
            labAssignmentId: id,
            studentId: userId,
          },
        });
      }
    }

    return {
      ...assignment,
      submission,
    };
  }

  async submitLab(
    studentId: string,
    data: {
      labAssignmentId: string;
      teamId?: string;
      fileUrl: string;
    },
  ) {

    const assignment = await this.prisma.labAssignment.findUnique({
      where: { id: data.labAssignmentId },
    });
    if (!assignment) {
      throw new NotFoundException('Лабораторная работа не найдена');
    }

    if (assignment.isTeam) {
      if (!data.teamId) {
        throw new BadRequestException('Для командной работы необходимо указать teamId');
      }

      const membership = await this.prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: data.teamId,
            userId: studentId,
          },
        },
      });
      if (!membership) {
        throw new ForbiddenException('Вы не состоите в указанной команде');
      }
    }

    return this.prisma.labSubmission.create({
      data: {
        labAssignmentId: data.labAssignmentId,
        studentId: assignment.isTeam ? null : studentId,
        teamId: assignment.isTeam ? data.teamId : null,
        fileUrl: data.fileUrl,
        status: SubmissionStatus.PENDING,
      },
    });
  }

  async getSubmissions(labAssignmentId: string) {
    return this.prisma.labSubmission.findMany({
      where: {
        labAssignmentId,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        team: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  async gradeSubmission(
    teacherId: string,
    submissionId: string,
    grade: number,
    comment?: string,
  ) {
    const submission = await this.prisma.labSubmission.findUnique({
      where: { id: submissionId },
      include: {
        labAssignment: true,
      },
    });
    if (!submission) {
      throw new NotFoundException('Решение не найдено');
    }

    const maxGrade = submission.labAssignment.maxGrade;
    if (grade < 1 || grade > maxGrade) {
      throw new BadRequestException(`Оценка должна быть в диапазоне от 1 до ${maxGrade}`);
    }

    const status = grade >= 3 ? SubmissionStatus.GRADED : SubmissionStatus.REJECTED;

    return this.prisma.labSubmission.update({
      where: { id: submissionId },
      data: {
        grade,
        teacherComment: comment || null,
        status,
        gradedById: teacherId,
        gradedAt: new Date(),
      },
    });
  }

  async createTeam(
    studentId: string,
    data: {
      labAssignmentId: string;
      name: string;
    },
  ) {
    const assignment = await this.prisma.labAssignment.findUnique({
      where: { id: data.labAssignmentId },
    });
    if (!assignment) {
      throw new NotFoundException('Лабораторная работа не найдена');
    }
    if (!assignment.isTeam) {
      throw new BadRequestException('Данная работа не является командной');
    }

    return this.prisma.projectTeam.create({
      data: {
        labAssignmentId: data.labAssignmentId,
        name: data.name,
        members: {
          create: {
            userId: studentId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async addTeamMember(
    studentId: string,
    teamId: string,
    userId: string,
  ) {
    const team = await this.prisma.projectTeam.findUnique({
      where: { id: teamId },
    });
    if (!team) {
      throw new NotFoundException('Команда не найдена');
    }

    const membership = await this.prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: studentId,
        },
      },
    });
    if (!membership) {
      throw new ForbiddenException('Вы не состоите в этой команде и не можете добавлять участников');
    }

    const userToAdd = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userToAdd) {
      throw new NotFoundException('Пользователь для добавления не найден');
    }

    return this.prisma.teamMember.create({
      data: {
        teamId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}

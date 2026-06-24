import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmissionStatus } from '@prisma/client';

@Injectable()
export class LabsService {
  constructor(private prisma: PrismaService) {}

  async getAssignment(id: string) {
    const assignment = await this.prisma.labAssignment.findUnique({
      where: { id },
      include: {
        subject: true,
      },
    });
    if (!assignment) {
      throw new NotFoundException('Лабораторная работа не найдена');
    }
    return assignment;
  }

  async submitLab(
    studentId: string,
    data: {
      labAssignmentId: string;
      teamId?: string;
      fileUrl: string;
    },
  ) {
    // 1. Verify assignment exists
    const assignment = await this.prisma.labAssignment.findUnique({
      where: { id: data.labAssignmentId },
    });
    if (!assignment) {
      throw new NotFoundException('Лабораторная работа не найдена');
    }

    // 2. If it's a team assignment, verify team membership
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

    // 3. Create submission
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

    // Validate grade limits
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

    // Create team and add the creator as the first member
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

    // Verify requesting student is member of the team
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

    // Verify user to add exists
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

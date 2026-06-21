import { PrismaClient, Role, UserStatus, MarkType, WorkType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean up existing data (in order of dependencies)
  await prisma.labSubmission.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.projectTeam.deleteMany({});
  await prisma.labAssignment.deleteMany({});
  await prisma.grade.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.userToGroup.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@example.com',
      passwordHash,
      firstName: 'Иван',
      lastName: 'Иванов',
      middleName: 'Иванович',
      role: Role.TEACHER,
      status: UserStatus.ACTIVE,
    },
  });

  const student1 = await prisma.user.create({
    data: {
      email: 'student1@example.com',
      passwordHash,
      firstName: 'Алексей',
      lastName: 'Петров',
      middleName: 'Сергеевич',
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@example.com',
      passwordHash,
      firstName: 'Мария',
      lastName: 'Сидорова',
      middleName: 'Александровна',
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
    },
  });

  const studentExpelled = await prisma.user.create({
    data: {
      email: 'expelled@example.com',
      passwordHash,
      firstName: 'Дмитрий',
      lastName: 'Быков',
      middleName: 'Дмитриевич',
      role: Role.STUDENT,
      status: UserStatus.EXPELLED,
    },
  });

  console.log('Users seeded');

  // 2. Create Groups
  const group = await prisma.group.create({
    data: {
      name: 'ИП-41',
    },
  });

  // Link students to groups
  await prisma.userToGroup.createMany({
    data: [
      { userId: student1.id, groupId: group.id },
      { userId: student2.id, groupId: group.id },
      { userId: studentExpelled.id, groupId: group.id },
    ],
  });

  console.log('Groups seeded');

  // 3. Create Subjects
  const subject1 = await prisma.subject.create({
    data: {
      name: 'Веб-программирование',
      teachers: {
        connect: [{ id: teacher.id }],
      },
    },
  });

  const subject2 = await prisma.subject.create({
    data: {
      name: 'Базы данных',
      teachers: {
        connect: [{ id: teacher.id }],
      },
    },
  });

  console.log('Subjects seeded');

  // 4. Create Lessons
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const dateObj = new Date(dateStr);

  const startTime1 = new Date(dateObj);
  startTime1.setHours(9, 0, 0, 0);
  const endTime1 = new Date(dateObj);
  endTime1.setHours(10, 30, 0, 0);

  const lesson1 = await prisma.lesson.create({
    data: {
      subjectId: subject1.id,
      groupId: group.id,
      date: dateObj,
      startTime: startTime1,
      endTime: endTime1,
    },
  });

  const startTime2 = new Date(dateObj);
  startTime2.setHours(10, 45, 0, 0);
  const endTime2 = new Date(dateObj);
  endTime2.setHours(12, 15, 0, 0);

  const lesson2 = await prisma.lesson.create({
    data: {
      subjectId: subject2.id,
      groupId: group.id,
      date: dateObj,
      startTime: startTime2,
      endTime: endTime2,
    },
  });

  console.log('Lessons seeded');

  // 5. Create Grades
  await prisma.grade.create({
    data: {
      studentId: student1.id,
      lessonId: lesson1.id,
      value: 5,
      markType: MarkType.PRESENCE,
      type: WorkType.PRACTICE,
      comment: 'Отличная работа!',
      createdById: teacher.id,
    },
  });

  await prisma.grade.create({
    data: {
      studentId: student2.id,
      lessonId: lesson1.id,
      value: null,
      markType: MarkType.ABSENCE,
      type: WorkType.PRACTICE,
      comment: null,
      createdById: teacher.id,
    },
  });

  console.log('Grades seeded');

  // 6. Create Lab Assignments
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 7); // 7 days from now

  const labAssignment = await prisma.labAssignment.create({
    data: {
      subjectId: subject1.id,
      title: 'Лабораторная работа №1',
      description: 'Разработать REST API на NestJS',
      deadline,
      isTeam: false,
      maxGrade: 5,
      fileUrl: 'http://localhost:9000/gradebook-files/labs/lab1_instructions.pdf',
    },
  });

  console.log('Lab assignments seeded');

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

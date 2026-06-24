import { User, ScheduleEntry, LabAssignment, LabSubmission, ProjectTeam, JournalLesson, MarkType, WorkType } from "./types";

const DEFAULT_USERS: User[] = [
  {
    id: "teacher-1",
    email: "teacher@test.com",
    role: "TEACHER",
    firstName: "Иван",
    lastName: "Иванов",
    middleName: "Иванович",
    status: "ACTIVE"
  },
  {
    id: "student-1",
    email: "student@test.com",
    role: "STUDENT",
    firstName: "Петр",
    lastName: "Петров",
    middleName: "Петрович",
    status: "ACTIVE"
  },
  {
    id: "student-2",
    email: "student2@test.com",
    role: "STUDENT",
    firstName: "Сергей",
    lastName: "Сидоров",
    middleName: "Сергеевич",
    status: "ACTIVE"
  },
  {
    id: "student-3",
    email: "student3@test.com",
    role: "STUDENT",
    firstName: "Мария",
    lastName: "Кузнецова",
    middleName: "Ивановна",
    status: "ACTIVE"
  },
  {
    id: "student-4",
    email: "student4@test.com",
    role: "STUDENT",
    firstName: "Алексей",
    lastName: "Орлов",
    middleName: "Павлович",
    status: "EXPELLED"
  },
  {
    id: "student-5",
    email: "student5@test.com",
    role: "STUDENT",
    firstName: "Екатерина",
    lastName: "Соколова",
    middleName: "Дмитриевна",
    status: "ACTIVE"
  }
];

const DEFAULT_SCHEDULE: ScheduleEntry[] = [
  {
    id: "sched-1",
    subjectName: "Веб-технологии",
    groupName: "ИП-41",
    startTime: "2026-06-24T08:30:00.000Z",
    endTime: "2026-06-24T10:00:00.000Z",
    teacherName: "Иванов И.И.",
    room: "Аудитория 405"
  },
  {
    id: "sched-2",
    subjectName: "Архитектура систем",
    groupName: "ИП-41",
    startTime: "2026-06-24T10:15:00.000Z",
    endTime: "2026-06-24T11:45:00.000Z",
    teacherName: "Петров П.П.",
    room: "Лаборатория 12"
  },
  {
    id: "sched-3",
    subjectName: "Базы данных",
    groupName: "ИП-41",
    startTime: "2026-06-25T12:00:00.000Z",
    endTime: "2026-06-25T13:30:00.000Z",
    teacherName: "Сидоров С.С.",
    room: "Аудитория 204"
  }
];

const DEFAULT_LABS: LabAssignment[] = [
  {
    id: "lab-1",
    subjectId: "subj-web",
    subjectName: "Веб-технологии",
    title: "Лабораторная работа №1: Разработка адаптивного макета",
    description: "Разработать адаптивный макет с использованием HTML5, CSS3 и Flexbox/Grid. Обеспечить корректное отображение на мобильных устройствах.",
    deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isTeam: false,
    fileUrl: "/docs/lab1_tz.pdf",
    maxGrade: 10,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "lab-2",
    subjectId: "subj-web",
    subjectName: "Веб-технологии",
    title: "Лабораторная работа №2: Интеграция API и JWT авторизация",
    description: "Разработать авторизацию на JWT-токенах в HttpOnly Cookies. Подключить CRUD эндпоинты для работы с журналом. Работа выполняется в парах.",
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    isTeam: true,
    fileUrl: "/docs/lab2_tz.pdf",
    maxGrade: 10,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "lab-3",
    subjectId: "subj-web",
    subjectName: "Веб-технологии",
    title: "Лабораторная работа №3: Контейнеризация и Docker",
    description: "Создать Dockerfile и docker-compose.yml для веб-приложения. Развернуть бэкенд, базу данных PostgreSQL и Redis в контейнерах.",
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    isTeam: false,
    fileUrl: "/docs/lab3_tz.pdf",
    maxGrade: 10,
    createdAt: new Date(Date.now()).toISOString()
  }
];

const DEFAULT_TEAMS: ProjectTeam[] = [
  {
    id: "team-1",
    labAssignmentId: "lab-2",
    name: "Веб-Мастера",
    members: [
      { userId: "student-1", user: { firstName: "Петр", lastName: "Петров" } },
      { userId: "student-2", user: { firstName: "Сергей", lastName: "Сидоров" } }
    ]
  }
];

const DEFAULT_SUBMISSIONS: LabSubmission[] = [
  {
    id: "sub-1",
    labAssignmentId: "lab-1",
    studentId: "student-1",
    teamId: null,
    fileUrl: "https://minio.mock-s3.local/labs/lab1_petrov_final.zip",
    submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: "GRADED",
    grade: 10,
    teacherComment: "Отличная верстка, адаптив выполнен без багов. Молодец!",
    gradedById: "teacher-1",
    gradedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "sub-2",
    labAssignmentId: "lab-1",
    studentId: "student-3",
    teamId: null,
    fileUrl: "https://minio.mock-s3.local/labs/lab1_kuznetsova.zip",
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: "PENDING",
    grade: null,
    teacherComment: null,
    gradedById: null,
    gradedAt: null
  }
];

const DEFAULT_LESSONS: JournalLesson[] = [
  { id: "lesson-1", date: "2026-06-10", startTime: "2026-06-10T08:30:00.000Z", endTime: "2026-06-10T10:00:00.000Z" },
  { id: "lesson-2", date: "2026-06-17", startTime: "2026-06-17T08:30:00.000Z", endTime: "2026-06-17T10:00:00.000Z" },
  { id: "lesson-3", date: "2026-06-24", startTime: "2026-06-24T08:30:00.000Z", endTime: "2026-06-24T10:00:00.000Z" }
];

const DEFAULT_CELLS: { [studentId: string]: { [lessonId: string]: any } } = {
  "student-1": {
    "lesson-1": { id: "g-1", value: 10, markType: "PRESENCE", type: "PRACTICE", comment: "Отлично работал" },
    "lesson-2": { id: "g-2", value: 8, markType: "PRESENCE", type: "TEST", comment: "Контрольный тест" },
    "lesson-3": { id: "g-3", value: null, markType: "DELAY", type: "THEORY", comment: "Опоздал на 20 минут" }
  },
  "student-2": {
    "lesson-1": { id: "g-4", value: 8, markType: "PRESENCE", type: "PRACTICE", comment: null },
    "lesson-2": { id: "g-5", value: null, markType: "ABSENCE", type: "TEST", comment: "Уважительная причина" },
    "lesson-3": null
  },
  "student-3": {
    "lesson-1": { id: "g-6", value: 9, markType: "PRESENCE", type: "PRACTICE", comment: null },
    "lesson-2": { id: "g-7", value: 10, markType: "PRESENCE", type: "TEST", comment: "Идеально сдал тест" },
    "lesson-3": { id: "g-8", value: 8, markType: "PRESENCE", type: "THEORY", comment: null }
  },
  "student-4": {

    "lesson-1": { id: "g-9", value: 6, markType: "PRESENCE", type: "PRACTICE", comment: null },
    "lesson-2": null,
    "lesson-3": null
  },
  "student-5": {

    "lesson-1": null,
    "lesson-2": null,
    "lesson-3": { id: "g-10", value: null, markType: "PRESENCE", type: "THEORY", comment: null }
  }
};

const isServer = typeof window === "undefined";

function getLocal<T>(key: string, fallback: T): T {
  if (isServer) return fallback;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : fallback;
}

function setLocal<T>(key: string, value: T): void {
  if (!isServer) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export class MockDatabase {
  static getUsers(): User[] {
    return getLocal("db_users", DEFAULT_USERS);
  }

  static saveUsers(users: User[]) {
    setLocal("db_users", users);
  }

  static getSchedule(): ScheduleEntry[] {
    return getLocal("db_schedule", DEFAULT_SCHEDULE);
  }

  static getLabs(): LabAssignment[] {
    return getLocal("db_labs", DEFAULT_LABS);
  }

  static getTeams(): ProjectTeam[] {
    return getLocal("db_teams", DEFAULT_TEAMS);
  }

  static saveTeams(teams: ProjectTeam[]) {
    setLocal("db_teams", teams);
  }

  static getSubmissions(): LabSubmission[] {
    return getLocal("db_submissions", DEFAULT_SUBMISSIONS);
  }

  static saveSubmissions(subs: LabSubmission[]) {
    setLocal("db_submissions", subs);
  }

  static getLessons(): JournalLesson[] {
    return getLocal("db_lessons", DEFAULT_LESSONS);
  }

  static saveLessons(lessons: JournalLesson[]) {
    setLocal("db_lessons", lessons);
  }

  static getCells(): any {
    return getLocal("db_cells", DEFAULT_CELLS);
  }

  static saveCells(cells: any) {
    setLocal("db_cells", cells);
  }
}

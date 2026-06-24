export type UserRole = "STUDENT" | "TEACHER";
export type UserStatus = "ACTIVE" | "EXPELLED";
export type MarkType = "PRESENCE" | "ABSENCE" | "DELAY";
export type WorkType = "LAB" | "TEST" | "PRACTICE" | "EXAM" | "THEORY";
export type SubmissionStatus = "PENDING" | "GRADED" | "REJECTED";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  status: UserStatus;
}

export interface ScheduleEntry {
  id: string;
  subjectName: string;
  groupName: string;
  startTime: string;
  endTime: string;
  teacherName: string;
  room?: string;
}

export interface LabAssignment {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  description: string;
  deadline: string;
  isTeam: boolean;
  fileUrl?: string;
  maxGrade: number;
  createdAt: string;
}

export interface LabSubmission {
  id: string;
  labAssignmentId: string;
  labAssignmentTitle?: string;
  studentId: string | null;
  studentName?: string;
  teamId: string | null;
  teamName?: string;
  fileUrl: string;
  submittedAt: string;
  status: SubmissionStatus;
  grade: number | null;
  teacherComment: string | null;
  gradedById: string | null;
  gradedAt: string | null;
}

export interface ProjectTeam {
  id: string;
  labAssignmentId: string;
  name: string;
  members: Array<{
    userId: string;
    user: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export interface JournalLesson {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface JournalGradeCell {
  id: string;
  value: number | null;
  markType: MarkType;
  type: WorkType;
  comment: string | null;
}

export interface JournalStudentRow {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  status: UserStatus;
  isNew?: boolean;
  grades: {
    [lessonId: string]: JournalGradeCell | null;
  };
}

export interface JournalMatrixResponse {
  lessons: JournalLesson[];
  students: JournalStudentRow[];
}

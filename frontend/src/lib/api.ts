import axios from "axios";
import { MockDatabase } from "./mockData";
import { User, ScheduleEntry, LabAssignment, LabSubmission, JournalMatrixResponse, MarkType, WorkType } from "./types";

const USE_MOCK = true;

const api = axios.create({
  baseURL: "/api",
  withCredentials: true
});

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export const ApiClient = {
  auth: {
    login: async (email: string, passwordHash: string): Promise<{ success: boolean; user: User }> => {
      if (USE_MOCK) {
        await delay(500);
        const users = MockDatabase.getUsers();
        const user = users.find((u) => u.email === email);
        if (!user) throw new Error("Пользователь не найден");
        
        if (typeof window !== "undefined") {
          localStorage.setItem("mock_session", JSON.stringify(user));
        }
        return { success: true, user };
      }
      const res = await api.post("/auth/login", { email, password: passwordHash });
      return res.data;
    },

    logout: async (): Promise<{ success: boolean }> => {
      if (USE_MOCK) {
        await delay(300);
        if (typeof window !== "undefined") {
          localStorage.removeItem("mock_session");
        }
        return { success: true };
      }
      const res = await api.post("/auth/logout");
      return res.data;
    },

    me: async (): Promise<User | null> => {
      if (USE_MOCK) {
        await delay(200);
        if (typeof window !== "undefined") {
          const userStr = localStorage.getItem("mock_session");
          return userStr ? JSON.parse(userStr) : null;
        }
        return null;
      }
      try {
        const res = await api.get("/auth/me");
        return res.data;
      } catch {
        return null;
      }
    }
  },

  schedule: {
    get: async (dateString: string): Promise<ScheduleEntry[]> => {
      if (USE_MOCK) {
        await delay(400);
        const schedule = MockDatabase.getSchedule();
        return schedule;
      }
      const res = await api.get(`/schedule?date=${dateString}`);
      return res.data;
    }
  },

  journal: {
    getMatrix: async (groupId: string, subjectId: string): Promise<JournalMatrixResponse> => {
      if (USE_MOCK) {
        await delay(500);
        const lessons = MockDatabase.getLessons();
        const users = MockDatabase.getUsers();
        const cells = MockDatabase.getCells();

        const students = users.filter((u) => u.role === "STUDENT");

        const studentRows = students.map((s) => {
          const studentGrades: { [lessonId: string]: any } = {};
          lessons.forEach((l) => {
            const studentCell = cells[s.id]?.[l.id] || null;
            studentGrades[l.id] = studentCell;
          });

          const isNew = s.id === "student-5";

          return {
            id: s.id,
            firstName: s.firstName,
            lastName: s.lastName,
            middleName: s.middleName || null,
            status: s.status,
            isNew,
            grades: studentGrades
          };
        });

        return { lessons, students: studentRows };
      }
      const res = await api.get(`/journal?groupId=${groupId}&subjectId=${subjectId}`);
      return res.data;
    },

    createLesson: async (payload: {
      subjectId: string;
      groupId: string;
      date: string;
      startTime: string;
      endTime: string;
    }): Promise<any> => {
      if (USE_MOCK) {
        await delay(400);
        const lessons = MockDatabase.getLessons();
        const newLesson = {
          id: `lesson-${lessons.length + 1}`,
          date: payload.date,
          startTime: payload.startTime,
          endTime: payload.endTime
        };
        lessons.push(newLesson);
        MockDatabase.saveLessons(lessons);
        return newLesson;
      }
      const res = await api.post("/lessons", payload);
      return res.data;
    },

    saveGrade: async (payload: {
      studentId: string;
      lessonId: string;
      value?: number | null;
      markType: MarkType;
      type: WorkType;
      comment?: string;
    }): Promise<any> => {
      if (USE_MOCK) {
        await delay(300);
        const cells = MockDatabase.getCells();
        const lessons = MockDatabase.getLessons();
        const lesson = lessons.find((l) => l.id === payload.lessonId);

        let finalMarkType = payload.markType;

        if (lesson && payload.markType === "PRESENCE") {
          const lessonStart = new Date(lesson.startTime);
          const isLate = false;
        }

        if (!cells[payload.studentId]) {
          cells[payload.studentId] = {};
        }

        const gradeId = cells[payload.studentId][payload.lessonId]?.id || `grade-${Math.random().toString(36).substr(2, 9)}`;

        const updatedCell = {
          id: gradeId,
          value: payload.value ?? null,
          markType: finalMarkType,
          type: payload.type,
          comment: payload.comment || null
        };

        cells[payload.studentId][payload.lessonId] = updatedCell;
        MockDatabase.saveCells(cells);
        return updatedCell;
      }
      const res = await api.post("/grades", payload);
      return res.data;
    }
  },

  labs: {
    getAssignments: async (subjectId: string): Promise<LabAssignment[]> => {
      if (USE_MOCK) {
        await delay(300);
        return MockDatabase.getLabs();
      }
      const res = await api.get(`/labs/assignment/${subjectId}`);
      return res.data;
    },

    getAssignmentById: async (id: string): Promise<LabAssignment | null> => {
      if (USE_MOCK) {
        await delay(200);
        const labs = MockDatabase.getLabs();
        return labs.find((l) => l.id === id) || null;
      }
      const res = await api.get(`/labs/assignment/detail/${id}`);
      return res.data;
    },

    submit: async (payload: {
      labAssignmentId: string;
      studentId: string | null;
      teamId: string | null;
      fileUrl: string;
    }): Promise<LabSubmission> => {
      if (USE_MOCK) {
        await delay(500);
        const subs = MockDatabase.getSubmissions();
        const labs = MockDatabase.getLabs();
        const lab = labs.find((l) => l.id === payload.labAssignmentId);

        let studentName = "Студент";
        let teamName = undefined;

        if (payload.studentId) {
          const users = MockDatabase.getUsers();
          const u = users.find((x) => x.id === payload.studentId);
          if (u) studentName = `${u.lastName} ${u.firstName[0]}.`;
        }

        if (payload.teamId) {
          const teams = MockDatabase.getTeams();
          const t = teams.find((x) => x.id === payload.teamId);
          if (t) teamName = t.name;
        }

        const newSubmission: LabSubmission = {
          id: `sub-${subs.length + 1}`,
          labAssignmentId: payload.labAssignmentId,
          labAssignmentTitle: lab?.title || "Лабораторная работа",
          studentId: payload.studentId,
          studentName,
          teamId: payload.teamId,
          teamName,
          fileUrl: payload.fileUrl,
          submittedAt: new Date().toISOString(),
          status: "PENDING",
          grade: null,
          teacherComment: null,
          gradedById: null,
          gradedAt: null
        };

        subs.push(newSubmission);
        MockDatabase.saveSubmissions(subs);
        return newSubmission;
      }
      const res = await api.post("/labs/submit", payload);
      return res.data;
    },

    getSubmissions: async (labAssignmentId: string): Promise<LabSubmission[]> => {
      if (USE_MOCK) {
        await delay(400);
        const subs = MockDatabase.getSubmissions();
        const users = MockDatabase.getUsers();
        
        return subs
          .filter((s) => s.labAssignmentId === labAssignmentId)
          .map((s) => {
            if (s.studentId && !s.studentName) {
              const u = users.find((x) => x.id === s.studentId);
              s.studentName = u ? `${u.lastName} ${u.firstName}` : "Неизвестный студент";
            }
            return s;
          });
      }
      const res = await api.get(`/labs/submissions?labAssignmentId=${labAssignmentId}`);
      return res.data;
    },

    gradeSubmission: async (payload: {
      submissionId: string;
      grade: number;
      comment?: string;
      teacherId: string;
    }): Promise<LabSubmission> => {
      if (USE_MOCK) {
        await delay(400);
        const subs = MockDatabase.getSubmissions();
        const subIndex = subs.findIndex((s) => s.id === payload.submissionId);
        if (subIndex === -1) throw new Error("Сдача не найдена");

        subs[subIndex].status = "GRADED";
        subs[subIndex].grade = payload.grade;
        subs[subIndex].teacherComment = payload.comment || null;
        subs[subIndex].gradedById = payload.teacherId;
        subs[subIndex].gradedAt = new Date().toISOString();

        MockDatabase.saveSubmissions(subs);
        return subs[subIndex];
      }
      const res = await api.post(`/labs/submissions/${payload.submissionId}/grade`, {
        grade: payload.grade,
        comment: payload.comment
      });
      return res.data;
    }
  }
};

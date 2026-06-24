"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { LabAssignment, LabSubmission, User } from "@/lib/types";
import { ApiClient } from "@/lib/api";
import { MockDatabase } from "@/lib/mockData";
import { ArrowLeft, Calendar, FileText, CheckCircle2, AlertTriangle, UploadCloud, Users, Paperclip, Loader2 } from "lucide-react";

export default function StudentLabSubmissionPage() {
  const { id: labId } = useParams();
  const router = useRouter();
  const [lab, setLab] = useState<LabAssignment | null>(null);
  const [submission, setSubmission] = useState<LabSubmission | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {

        const labData = await ApiClient.labs.getAssignmentById(labId as string);
        setLab(labData);

        const allUsers = MockDatabase.getUsers();
        const studentUsers = allUsers.filter(u => u.role === "STUDENT" && u.id !== "student-1" && u.status === "ACTIVE");
        setStudents(studentUsers);

        const allSubs = await ApiClient.labs.getSubmissions(labId as string);
        const existingSub = allSubs.find(s => s.studentId === "student-1" || s.teamId === "team-1");
        if (existingSub) {
          setSubmission(existingSub);
        }
      } catch (err) {
        console.error("Failed to load lab data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [labId]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setSubmitting(true);
    try {

      const mockFileUrl = `https://minio.mock-s3.local/labs/${selectedFile.name.toLowerCase().replace(/\s+/g, "_")}`;

      const payload = {
        labAssignmentId: labId as string,
        studentId: lab?.isTeam ? null : "student-1",
        teamId: lab?.isTeam ? "team-1" : null,
        fileUrl: mockFileUrl
      };

      const result = await ApiClient.labs.submit(payload);
      setSubmission(result);
      alert("Работа успешно отправлена на проверку!");
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Ошибка отправки работы");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="text-center p-12">
        <p className="text-red-400">Лабораторная работа не найдена</p>
      </div>
    );
  }

  const formattedDeadline = new Date(lab.deadline).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {}
      <Link
        href={`/student/subject/${lab.subjectId}`}
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" /> Вернуться к предмету
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        {}
        <div className="md:col-span-2 space-y-6">
          <div className="glass p-6 rounded-xl border border-zinc-800 space-y-4">
            <div>
              <span className="text-[10px] font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 uppercase tracking-wider">
                {lab.subjectName}
              </span>
              <h1 className="text-xl font-bold text-white mt-2 leading-snug">{lab.title}</h1>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line">
              {lab.description}
            </p>

            <div className="flex flex-wrap gap-4 text-xs font-medium text-zinc-500 border-t border-zinc-900 pt-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-zinc-500" />
                <span>Сдать до: {formattedDeadline}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-zinc-500" />
                <span>Максимальный балл: {lab.maxGrade}</span>
              </div>
            </div>

            {lab.fileUrl && (
              <a
                href={lab.fileUrl}
                className="flex items-center gap-2 p-3 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold text-orange-400 transition"
              >
                <Paperclip className="h-4 w-4" />
                Скачать техническое задание (ТЗ)
              </a>
            )}
          </div>

          {}
          {!submission ? (
            <form onSubmit={handleSubmit} className="glass p-6 rounded-xl border border-zinc-800 space-y-6">
              <h2 className="text-sm font-bold text-white">Отправка решения</h2>

              {}
              {lab.isTeam && (
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <Users className="h-4 w-4" /> Выберите напарника по команде
                  </label>
                  <select
                    value={selectedPartnerId}
                    onChange={(e) => setSelectedPartnerId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="">-- Выбрать из списка группы --</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.lastName} {student.firstName} {student.middleName}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-zinc-500">
                    Для командных работ оценка выставляется автоматически обоим участникам команды.
                  </p>
                </div>
              )}

              {}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition ${
                  dragActive ? "border-orange-500 bg-orange-500/5" : "border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  required
                  className="hidden"
                />

                <UploadCloud className="h-10 w-10 text-zinc-500" />

                <div className="text-center">
                  <label htmlFor="file-upload" className="text-xs font-bold text-orange-400 hover:text-orange-300 cursor-pointer transition">
                    Загрузить файл
                  </label>
                  <span className="text-xs text-zinc-500"> или перетащите его сюда</span>
                </div>
                <p className="text-[10px] text-zinc-500">Поддерживаются ZIP, RAR, PDF файлы до 20 МБ</p>

                {selectedFile && (
                  <div className="flex items-center gap-2 mt-4 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white">
                    <FileText className="h-4 w-4 text-orange-400" />
                    <span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!selectedFile || submitting}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Загрузка в S3...
                  </>
                ) : (
                  "Отправить работу преподавателю"
                )}
              </button>
            </form>
          ) : (

            <div className="glass p-6 rounded-xl border border-zinc-800 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                <h2 className="text-sm font-bold text-white">Ваше решение отправлено</h2>

                {}
                {submission.status === "PENDING" ? (
                  <span className="text-xs font-semibold text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-lg border border-yellow-500/20">
                    На проверке
                  </span>
                ) : submission.status === "REJECTED" ? (
                  <span className="text-xs font-semibold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">
                    Отклонено
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    Сдано (Оценка: {submission.grade})
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium">Отправленный файл:</span>
                  <a href={submission.fileUrl} className="text-orange-400 hover:text-orange-300 font-semibold truncate max-w-xs flex items-center gap-1">
                    <Paperclip className="h-3.5 w-3.5" /> Решение.zip
                  </a>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-medium">Дата отправки:</span>
                  <span className="text-white font-medium">
                    {new Date(submission.submittedAt).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {submission.teamName && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-medium">Сдано командой:</span>
                    <span className="text-orange-400 font-bold">{submission.teamName}</span>
                  </div>
                )}
              </div>

              {}
              {(submission.teacherComment || submission.status === "GRADED") && (
                <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Отзыв преподавателя</p>
                  {submission.teacherComment ? (
                    <p className="text-xs text-zinc-300 italic">« {submission.teacherComment} »</p>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">Комментарий отсутствует</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {}
        <div className="space-y-6">
          <div className="glass p-5 rounded-xl border border-zinc-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Критерии оценки</h3>
            <ul className="space-y-2.5 text-xs text-zinc-400 font-medium">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                <span>Верстка соответствует макету (Figma) — до 2 баллов</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                <span>Адаптивность (мобильные и планшеты) — до 2 баллов</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                <span>Валидность кода и семантика HTML5 — 1 балл</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

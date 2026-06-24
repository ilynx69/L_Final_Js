"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LabAssignment, LabSubmission } from "@/lib/types";
import { ApiClient } from "@/lib/api";
import { ArrowLeft, Clock, CheckCircle2, AlertTriangle, Paperclip, Loader2, Award, ClipboardCheck, X } from "lucide-react";

export default function TeacherLabDetailsPage() {
  const { id: labId } = useParams();
  const [lab, setLab] = useState<LabAssignment | null>(null);
  const [submissions, setSubmissions] = useState<LabSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const [selectedSub, setSelectedSub] = useState<LabSubmission | null>(null);
  const [gradeInput, setGradeInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>("");
  const [gradingSubmit, setGradingSubmit] = useState<boolean>(false);

  async function loadData() {
    try {
      const labData = await ApiClient.labs.getAssignmentById(labId as string);
      setLab(labData);

      const subsData = await ApiClient.labs.getSubmissions(labId as string);
      setSubmissions(subsData);
    } catch (err) {
      console.error("Failed to load lab details:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [labId]);

  const openGradingDrawer = (sub: LabSubmission) => {
    setSelectedSub(sub);
    setGradeInput(sub.grade || 5);
    setCommentInput(sub.teacherComment || "");
  };

  const closeGradingDrawer = () => {
    setSelectedSub(null);
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    setGradingSubmit(true);
    try {
      await ApiClient.labs.gradeSubmission({
        submissionId: selectedSub.id,
        grade: gradeInput,
        comment: commentInput,
        teacherId: "teacher-1"
      });

      await loadData();
      closeGradingDrawer();
      alert("Оценка успешно выставлена!");
    } catch (err) {
      console.error("Grading failed:", err);
      alert("Ошибка при выставлении оценки");
    } finally {
      setGradingSubmit(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "PENDING") return sub.status === "PENDING";
    if (filterStatus === "GRADED") return sub.status === "GRADED";
    return true;
  });

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

  return (
    <div className="space-y-6 relative min-h-[calc(100vh-8rem)]">
      {}
      <Link
        href="/teacher/labs"
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" /> Назад к списку лаб
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 uppercase tracking-wider">
            {lab.subjectName}
          </span>
          <h1 className="text-xl font-bold text-white mt-1 leading-snug">{lab.title}</h1>
        </div>

        {}
        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg self-start">
          {["ALL", "PENDING", "GRADED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition ${
                filterStatus === status
                  ? "bg-orange-600 text-white shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {status === "ALL" ? "Все сдавшие" : status === "PENDING" ? "Непроверенные" : "Проверенные"}
            </button>
          ))}
        </div>
      </div>

      {}
      {filteredSubmissions.length === 0 ? (
        <div className="glass p-12 rounded-xl text-center border border-zinc-800">
          <Clock className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-500">Сданных работ в этой категории нет</p>
        </div>
      ) : (
        <div className="glass rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Студент / Команда</th>
                <th className="p-4">Решение (Файл)</th>
                <th className="p-4">Дата сдачи</th>
                <th className="p-4">Статус проверки</th>
                <th className="p-4 text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {filteredSubmissions.map((sub) => {
                const isPending = sub.status === "PENDING";

                return (
                  <tr key={sub.id} className="hover:bg-zinc-900/30 transition group">
                    <td className="p-4 font-bold text-white">
                      {sub.teamName ? (
                        <div className="flex flex-col">
                          <span>{sub.teamName}</span>
                          <span className="text-[10px] text-orange-400 font-medium font-bold uppercase">Командная</span>
                        </div>
                      ) : (
                        sub.studentName || "Студент"
                      )}
                    </td>
                    <td className="p-4">
                      <a
                        href={sub.fileUrl}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-orange-400 hover:text-orange-300 font-medium hover:underline text-xs"
                      >
                        <Paperclip className="h-3.5 w-3.5" /> Скачать zip
                      </a>
                    </td>
                    <td className="p-4 text-xs text-zinc-400 font-medium">
                      {new Date(sub.submittedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="p-4">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                          На проверке
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Оценка: {sub.grade}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openGradingDrawer(sub)}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-orange-600/10 border border-zinc-800 hover:border-orange-600/30 text-zinc-300 hover:text-orange-400 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        {isPending ? "Оценить" : "Редактировать"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          {}
          <div className="flex-1" onClick={closeGradingDrawer} />

          {}
          <div className="w-full max-w-md h-full bg-[#09090b] border-l border-zinc-800 p-6 flex flex-col justify-between shadow-2xl relative animate-slide-in">
            <div className="space-y-6">
              {}
              <div className="flex justify-between items-start pb-4 border-b border-zinc-900">
                <div>
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Проверка решения</h3>
                  <h2 className="text-base font-bold text-white mt-1">
                    {selectedSub.teamName ? `Команда: ${selectedSub.teamName}` : selectedSub.studentName}
                  </h2>
                </div>
                <button
                  onClick={closeGradingDrawer}
                  className="h-8 w-8 rounded-lg bg-zinc-950 border border-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white cursor-pointer transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {}
              <div className="space-y-4">
                <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Файл с решением:</span>
                  <a href={selectedSub.fileUrl} className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1">
                    <Paperclip className="h-4 w-4" /> Скачать (.zip)
                  </a>
                </div>
              </div>

              {}
              <form id="grading-form" onSubmit={handleGradeSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    <Award className="h-4 w-4 text-orange-400" /> Выставить оценку (макс. {lab.maxGrade})
                  </label>
                  <select
                    value={gradeInput}
                    onChange={(e) => setGradeInput(parseInt(e.target.value))}
                    className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((g) => {
                      let label = "";
                      if (g === 10 || g === 9) label = "— Отлично";
                      else if (g === 8) label = "— Очень хорошо";
                      else if (g === 7) label = "— Хорошо";
                      else if (g === 6) label = "— Почти хорошо";
                      else if (g === 5) label = "— Удовлетворительно";
                      else if (g === 4) label = "— Достаточно";
                      else label = "— Неудовлетворительно";
                      return (
                        <option key={g} value={g}>{g} {label}</option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Отзыв / Комментарий к оценке
                  </label>
                  <textarea
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    rows={4}
                    placeholder="Укажите замечания по верстке или логике приложения..."
                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>
              </form>
            </div>

            {}
            <div className="border-t border-zinc-900 pt-4 flex gap-3">
              <button
                type="button"
                onClick={closeGradingDrawer}
                className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg font-semibold text-xs transition cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                form="grading-form"
                disabled={gradingSubmit}
                className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-600/20 disabled:opacity-50"
              >
                {gradingSubmit ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Сохранение...
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="h-4 w-4" /> Сохранить
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

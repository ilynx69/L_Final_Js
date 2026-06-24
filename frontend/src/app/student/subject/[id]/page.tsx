"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LabAssignment, LabSubmission } from "@/lib/types";
import { ApiClient } from "@/lib/api";
import { Calendar, ChevronRight, FileText, CheckCircle2, Clock, AlertTriangle, ArrowLeft } from "lucide-react";

export default function StudentSubjectDetailsPage() {
  const { id: subjectId } = useParams();
  const [labs, setLabs] = useState<LabAssignment[]>([]);
  const [submissions, setSubmissions] = useState<LabSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const assignmentsData = await ApiClient.labs.getAssignments(subjectId as string);
        setLabs(assignmentsData);

        const allSubs = await ApiClient.labs.getSubmissions("");
        const studentSubs = allSubs.filter(sub => sub.studentId === "student-1" || sub.teamId === "team-1");
        setSubmissions(studentSubs);
      } catch (err) {
        console.error("Failed to load subject details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [subjectId]);

  const getSubStatus = (labId: string) => {
    const sub = submissions.find((s) => s.labAssignmentId === labId);
    if (!sub) return { text: "Не сдано", color: "text-zinc-500 bg-zinc-900 border-zinc-800", icon: Clock };
    if (sub.status === "PENDING") return { text: "На проверке", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", icon: Clock };
    if (sub.status === "REJECTED") return { text: "Отклонено", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: AlertTriangle };
    return { text: `Оценка: ${sub.grade}/10`, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 };
  };

  return (
    <div className="space-y-6">
      {}
      <Link
        href="/student/subjects"
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" /> Назад к предметам
      </Link>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Веб-технологии</h1>
          <p className="text-xs text-zinc-400">Преподаватель: Иванов Иван Иванович</p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <span className="text-sm text-zinc-500 animate-pulse">Загрузка лабораторных...</span>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
            Лабораторные работы
          </h2>

          <div className="grid gap-4">
            {labs.map((lab) => {
              const status = getSubStatus(lab.id);
              const StatusIcon = status.icon;
              const formattedDeadline = new Date(lab.deadline).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "short"
              });

              return (
                <div key={lab.id} className="glass p-5 rounded-xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-orange-400 shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white leading-tight">{lab.title}</h3>
                      <p className="text-xs text-zinc-500 line-clamp-1 max-w-xl">{lab.description}</p>

                      <div className="flex items-center gap-3 text-[10px] font-medium text-zinc-500 pt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Дедлайн: {formattedDeadline}</span>
                        </div>
                        {lab.isTeam && (
                          <span className="text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20 text-[9px] uppercase font-bold">
                            Командная работа
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 border-t border-zinc-900 md:border-0 pt-3 md:pt-0">
                    {}
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold ${status.color}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.text}
                    </div>

                    <Link
                      href={`/student/lab/${lab.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      Решение <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

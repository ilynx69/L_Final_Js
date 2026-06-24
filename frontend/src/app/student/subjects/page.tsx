"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle, Percent, ArrowRight, BookMarked, Award } from "lucide-react";

export default function StudentSubjectsPage() {
  const [loading, setLoading] = useState(true);

  const subjects = [
    {
      id: "subj-web",
      name: "Веб-технологии",
      teacher: "Иванов И.И.",
      averageGrade: 4.8,
      labsCompleted: 2,
      labsTotal: 3,
      attendance: 92
    },
    {
      id: "subj-arch",
      name: "Архитектура систем",
      teacher: "Петров П.П.",
      averageGrade: 4.2,
      labsCompleted: 1,
      labsTotal: 2,
      attendance: 100
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Успеваемость по предметам</h1>
        <p className="text-xs text-zinc-400">Общие показатели и лабораторные работы</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <span className="text-sm text-zinc-500 animate-pulse">Загрузка данных...</span>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {subjects.map((subject) => {
            const completionPercent = Math.round((subject.labsCompleted / subject.labsTotal) * 100);

            return (
              <div key={subject.id} className="glass p-6 rounded-xl border border-zinc-800 flex flex-col justify-between gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-orange-400">
                      <BookMarked className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition">
                        {subject.name}
                      </h3>
                      <p className="text-[10px] text-zinc-500 font-medium">Преподаватель: {subject.teacher}</p>
                    </div>
                  </div>

                  {}
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-zinc-500 font-medium">Средний балл</span>
                    <span className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                      <Award className="h-4.5 w-4.5" />
                      {subject.averageGrade.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-b border-zinc-900 py-4 text-xs font-medium text-zinc-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>Сдано лаб: {subject.labsCompleted} / {subject.labsTotal} ({completionPercent}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-orange-400" />
                    <span>Посещаемость: {subject.attendance}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2">
                  {}
                  <div className="w-1/2 bg-zinc-900 rounded-full h-1.5 border border-zinc-800 overflow-hidden">
                    <div
                      className="bg-orange-600 h-1.5 rounded-full"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>

                  <Link
                    href={`/student/subject/${subject.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-lg text-[10px] font-semibold transition cursor-pointer"
                  >
                    Подробнее <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

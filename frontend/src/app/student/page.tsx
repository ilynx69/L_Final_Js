"use client";

import React, { useState, useEffect } from "react";
import { ScheduleEntry } from "@/lib/types";
import { ApiClient } from "@/lib/api";
import { Clock, MapPin, User, GraduationCap, Loader2 } from "lucide-react";

export default function StudentDashboard() {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchedule() {
      try {
        const today = new Date().toISOString().split("T")[0];
        const data = await ApiClient.schedule.get(today);
        setSchedule(data);
      } catch (err) {
        console.error("Failed to load schedule:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSchedule();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Мое Расписание</h1>
        <p className="text-xs text-zinc-400">Список занятий на сегодня</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : schedule.length === 0 ? (
        <div className="glass p-12 rounded-xl text-center">
          <GraduationCap className="h-10 w-10 text-zinc-600 mx-auto mb-4" />
          <p className="text-sm font-medium text-zinc-400">На сегодня занятий нет</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {schedule.map((entry) => {
            const start = new Date(entry.startTime).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
            const end = new Date(entry.endTime).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

            return (
              <div key={entry.id} className="glass glass-interactive p-6 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-600 group-hover:bg-orange-500 transition" />
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-[10px] font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 uppercase tracking-wider">
                      {entry.groupName}
                    </span>
                    <h3 className="text-base font-bold text-white mt-2 group-hover:text-orange-400 transition truncate">
                      {entry.subjectName}
                    </h3>
                  </div>

                  <div className="space-y-2 border-t border-zinc-900 pt-4 text-xs font-medium text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-zinc-500" />
                      <span>{start} - {end}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-zinc-500" />
                      <span>{entry.room || "Лаборатория"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-zinc-500" />
                      <span>{entry.teacherName}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

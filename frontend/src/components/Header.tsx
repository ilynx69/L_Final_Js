"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Bell, GraduationCap, Calendar as CalendarIcon } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Header() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  // Derive title from pathname
  let sectionTitle = "Личный кабинет";
  if (pathname.includes("/schedule") || pathname === "/student" || pathname === "/teacher") {
    sectionTitle = "Расписание занятий";
  } else if (pathname.includes("/journal")) {
    sectionTitle = "Журнал успеваемости";
  } else if (pathname.includes("/labs") || pathname.includes("/lab/")) {
    sectionTitle = "Лабораторные работы";
  } else if (pathname.includes("/subject")) {
    sectionTitle = "Успеваемость по предмету";
  }

  const formattedDate = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <header className="h-16 border-b border-zinc-900 bg-[#09090b]/40 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
      <div>
        <h2 className="text-base font-bold text-white tracking-tight">{sectionTitle}</h2>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium capitalize">
          <CalendarIcon className="h-3 w-3" />
          <span>{formattedDate}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications button */}
        <button className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer relative">
          <Bell className="h-4 w-4" />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-purple-500 ring-2 ring-[#09090b]" />
        </button>

        {/* User preview badge */}
        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            {user.role === "TEACHER" ? "Преподаватель" : "Студент"}
          </span>
        </div>
      </div>
    </header>
  );
}

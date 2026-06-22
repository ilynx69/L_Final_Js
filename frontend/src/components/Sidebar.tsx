"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Calendar, BookOpen, GraduationCap, ClipboardList, LogOut, Settings } from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isTeacher = user.role === "TEACHER";

  const teacherLinks = [
    { name: "Расписание", href: "/teacher", icon: Calendar },
    { name: "Журнал успеваемости", href: "/teacher/journal", icon: BookOpen },
    { name: "Проверка лабораторных", href: "/teacher/labs", icon: ClipboardList }
  ];

  const studentLinks = [
    { name: "Мое Расписание", href: "/student", icon: Calendar },
    { name: "Успеваемость", href: "/student/subjects", icon: BookOpen }
  ];

  const activeLinks = isTeacher ? teacherLinks : studentLinks;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-zinc-900 bg-[#09090b]/80 backdrop-blur-md flex flex-col justify-between p-4">
      <div className="flex flex-col gap-8">
        {/* Logo / Title */}
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="h-9 w-9 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-tight uppercase">Gradebook</h1>
            <p className="text-[10px] text-zinc-500 font-medium">Кафедра ИТ</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1">
          <p className="px-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
            Разделы
          </p>
          {activeLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/student" && link.href !== "/teacher" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? "bg-purple-600/10 text-purple-400 border border-purple-600/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/50 border border-transparent"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-purple-400" : "text-zinc-500"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Actions & Footer */}
      <div className="flex flex-col gap-4 border-t border-zinc-900 pt-4">
        {/* User preview */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-semibold text-purple-400">
            {user.lastName[0]}{user.firstName[0]}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-semibold text-white truncate">
              {user.lastName} {user.firstName[0]}.
            </span>
            <span className="text-[9px] text-zinc-500 font-medium">
              {isTeacher ? "Преподаватель" : "Студент Гр. ИП-41"}
            </span>
          </div>
        </div>

        {/* Settings & Logout */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => alert("Раздел настроек в разработке")}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-zinc-500 hover:text-white transition cursor-pointer text-left"
          >
            <Settings className="h-4 w-4" />
            Настройки
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-red-400/80 hover:text-red-400 hover:bg-red-950/20 transition cursor-pointer text-left"
          >
            <LogOut className="h-4 w-4" />
            Выйти из системы
          </button>
        </div>
      </div>
    </aside>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Calendar, BookOpen, GraduationCap, ClipboardList, LogOut, Settings, X, User as UserIcon, Lock, Moon, Sun } from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Пароли не совпадают!");
      return;
    }
    alert("Пароль успешно обновлен!");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsSettingsOpen(false);
  };

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-zinc-200 dark:border-zinc-900 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md flex flex-col justify-between p-4 transition-colors">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="h-9 w-9 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/30">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-zinc-900 dark:text-white tracking-tight uppercase">Gradebook</h1>
              <p className="text-[10px] text-zinc-500 font-medium">Кафедра ИТ</p>
            </div>
          </div>

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
                      ? "bg-orange-600/10 text-orange-600 dark:text-orange-400 border border-orange-600/20"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900/50 border border-transparent"
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? "text-orange-600 dark:text-orange-400" : "text-zinc-400 dark:text-zinc-500"}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-t border-zinc-200 dark:border-zinc-900 pt-4">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-xs font-semibold text-orange-600 dark:text-orange-400">
              {user.lastName[0]}{user.firstName[0]}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                {user.lastName} {user.firstName[0]}.
              </span>
              <span className="text-[9px] text-zinc-500 font-medium">
                {isTeacher ? "Преподаватель" : "Студент Гр. ИП-41"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer text-left"
            >
              <Settings className="h-4 w-4" />
              Настройки
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer text-left"
            >
              <LogOut className="h-4 w-4" />
              Выйти из системы
            </button>
          </div>
        </div>
      </aside>

      {}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-900 p-6 rounded-2xl shadow-2xl relative space-y-6">

            {}
            <div className="flex justify-between items-start pb-4 border-b border-zinc-100 dark:border-zinc-900">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <Settings className="h-5 w-5" />
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">Настройки профиля</h2>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-900 flex items-center justify-center text-zinc-500 hover:text-zinc-950 dark:hover:text-white cursor-pointer transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {}
            <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-900 p-4 rounded-xl text-xs">
              <div className="space-y-1">
                <span className="text-zinc-400 block">Пользователь</span>
                <span className="font-bold text-zinc-900 dark:text-white">{user.lastName} {user.firstName} {user.middleName}</span>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-400 block">Электронная почта</span>
                <span className="font-bold text-zinc-900 dark:text-white">{user.email}</span>
              </div>
              <div className="space-y-1 mt-2">
                <span className="text-zinc-400 block">Роль</span>
                <span className="font-semibold text-orange-600 dark:text-orange-400 uppercase">{isTeacher ? "Преподаватель" : "Студент"}</span>
              </div>
              <div className="space-y-1 mt-2">
                <span className="text-zinc-400 block">Статус</span>
                <span className="font-semibold text-emerald-500 uppercase">Активен</span>
              </div>
            </div>

            {}
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-900 rounded-xl">
              <div className="flex items-center gap-2">
                {theme === "dark" ? <Moon className="h-4.5 w-4.5 text-orange-400" /> : <Sun className="h-4.5 w-4.5 text-yellow-500" />}
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Тема оформления</span>
              </div>
              <button
                onClick={toggleTheme}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                {theme === "dark" ? "Переключить на Светлую" : "Переключить на Темную"}
              </button>
            </div>

            {}
            <form onSubmit={handleSavePassword} className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Lock className="h-3.5 w-3.5 text-orange-500" /> Смена пароля
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="password"
                  placeholder="Старый пароль"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
                <input
                  type="password"
                  placeholder="Новый пароль"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
                <input
                  type="password"
                  placeholder="Повторить новый"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              {}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg font-semibold text-xs transition cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold text-xs transition cursor-pointer shadow-lg shadow-orange-600/20"
                >
                  Сохранить
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}

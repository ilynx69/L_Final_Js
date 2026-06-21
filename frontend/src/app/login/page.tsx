"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { useAuth } from "@/context/AuthContext";
import { Loader2, KeyRound, Mail, GraduationCap } from "lucide-react";

// Form Schema
const loginSchema = zod.object({
  email: zod.string().email("Введите корректный адрес электронной почты"),
  password: zod.string().min(6, "Пароль должен состоять минимум из 6 символов")
});

type LoginFormValues = zod.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, loading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setLoading(true);
    try {
      const success = await login(data.email, data.password);
      if (!success) {
        setError("Неверный email или пароль");
      }
    } catch (err: any) {
      setError(err?.message || "Произошла непредвиденная ошибка при авторизации");
    } finally {
      setLoading(false);
    }
  };

  const fillQuickLogin = (email: string) => {
    setValue("email", email);
    setValue("password", "password123");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 relative overflow-hidden">
      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-purple-900/10 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-indigo-900/10 blur-[100px]" />

      <div className="w-full max-w-md glass p-8 rounded-2xl relative z-10 border border-zinc-800">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500 mb-2">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Вход в систему</h1>
          <p className="text-sm text-zinc-400 text-center">Электронный Журнал кафедры веб-технологий</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-950/30 border border-red-500/30 text-red-400 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Email / Логин
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                {...register("email")}
                placeholder="student@test.com"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                disabled={loading || authLoading}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Пароль
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                <KeyRound className="h-4 w-4" />
              </span>
              <input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                disabled={loading || authLoading}
              />
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || authLoading}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/20 disabled:opacity-50"
          >
            {loading || authLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Авторизация...
              </>
            ) : (
              "Войти в журнал"
            )}
          </button>
        </form>

        {/* Quick Testing logins */}
        <div className="mt-8 pt-6 border-t border-zinc-900">
          <p className="text-xs font-medium text-zinc-500 text-center mb-4 uppercase tracking-wider">
            Быстрый вход для тестирования
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fillQuickLogin("student@test.com")}
              className="py-2 px-3 bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 transition text-center cursor-pointer"
            >
              🎓 Студент
            </button>
            <button
              onClick={() => fillQuickLogin("teacher@test.com")}
              className="py-2 px-3 bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 transition text-center cursor-pointer"
            >
              👨‍🏫 Преподаватель
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

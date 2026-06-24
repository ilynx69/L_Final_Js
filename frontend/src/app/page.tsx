"use client";

import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { loading } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-[#09090b] transition-colors">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="text-sm text-zinc-400">Загрузка системы...</p>
      </div>
    </main>
  );
}

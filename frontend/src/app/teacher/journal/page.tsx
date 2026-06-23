"use client";

import React, { useState } from "react";
import { BookOpen, Users, HelpCircle } from "lucide-react";

export default function TeacherJournalShell() {
  const [selectedGroup, setSelectedGroup] = useState("ИП-41");
  const [selectedSubject, setSelectedSubject] = useState("subj-web");

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Журнал успеваемости</h1>
          <p className="text-xs text-zinc-400">Проставление оценок, посещаемости и опозданий</p>
        </div>

        {/* Group and Subject Selectors */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300">
            <Users className="h-4 w-4 text-purple-400" />
            <span>Группа:</span>
            <select 
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ИП-41" className="bg-[#09090b]">ИП-41</option>
              <option value="ИП-42" className="bg-[#09090b]">ИП-42</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300">
            <BookOpen className="h-4 w-4 text-purple-400" />
            <span>Предмет:</span>
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="subj-web" className="bg-[#09090b]">Веб-технологии</option>
              <option value="subj-arch" className="bg-[#09090b]">Архитектура систем</option>
            </select>
          </div>
        </div>
      </div>

      {/* Info Tip block about grading */}
      <div className="p-4 bg-purple-950/15 border border-purple-500/20 text-purple-300 rounded-xl text-xs space-y-2 max-w-4xl">
        <h4 className="font-bold flex items-center gap-1.5 text-purple-400">
          <HelpCircle className="h-4 w-4" /> Быстрая справка по управлению журналом:
        </h4>
        <ul className="list-disc pl-4 space-y-1 font-medium text-zinc-400">
          <li><b className="text-zinc-200">Двойной клик на ячейку:</b> Открывает подробную форму выставления оценки и комментария.</li>
          <li><b className="text-zinc-200">Правый клик мыши:</b> Отмечает отсутствие студента (проставляет красную <span className="text-red-400 font-bold">Н</span>).</li>
          <li><b className="text-zinc-200">Клик колесиком мыши:</b> Отмечает опоздание студента (проставляет оранжевую <span className="text-yellow-500 font-bold">О</span>).</li>
          <li><b className="text-zinc-200">Клавиатура (1-5):</b> Быстро выставляет соответствующую оценку в выбранную ячейку. <kbd className="bg-zinc-800 text-white px-1.5 py-0.5 rounded text-[10px]">Backspace</kbd> очищает ячейку.</li>
        </ul>
      </div>

      {/* Grid Table Placeholder for Frontend 2 */}
      <div className="glass p-12 rounded-xl border border-zinc-800 flex flex-col items-center justify-center text-center h-[350px]">
        <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500 mb-4 animate-pulse">
          <BookOpen className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-white mb-1">Здесь будет располагаться интерактивная таблица журнала</h3>
        <p className="text-xs text-zinc-500 max-w-md">
          Компонент сетки оценок со сложным поведением мыши и клавиатуры в данный момент разрабатывается Frontend-разработчиком №2.
        </p>
      </div>
    </div>
  );
}

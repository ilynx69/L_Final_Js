"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Users, HelpCircle, Loader2, Plus, X, Calendar, Clock, AlertCircle } from "lucide-react";
import { ApiClient } from "@/lib/api";
import { JournalLesson, JournalStudentRow, MarkType, WorkType } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

export default function TeacherJournalPage() {
  const { user } = useAuth();

  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [lessons, setLessons] = useState<JournalLesson[]>([]);
  const [students, setStudents] = useState<JournalStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCell, setActiveCell] = useState<{ studentId: string; lessonId: string } | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    studentId: string;
    lessonId: string;
    studentName: string;
    lessonDate: string;
    value: string;
    markType: MarkType;
    type: WorkType;
    comment: string;
  } | null>(null);

  const [newLessonModalOpen, setNewLessonModalOpen] = useState(false);
  const [newLessonData, setNewLessonData] = useState({
    date: "",
    startTime: "08:30",
    endTime: "10:00"
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSelectors() {
      try {
        const groupsList = await ApiClient.journal.getGroups();
        const subjectsList = await ApiClient.journal.getSubjects();
        setGroups(groupsList);
        setSubjects(subjectsList);

        if (groupsList.length > 0) setSelectedGroup(groupsList[0].id);
        if (subjectsList.length > 0) setSelectedSubject(subjectsList[0].id);
      } catch (err) {
        console.error("Failed to load groups/subjects:", err);
        setError("Не удалось загрузить списки групп и предметов.");
      }
    }
    loadSelectors();
  }, []);

  useEffect(() => {
    if (!selectedGroup || !selectedSubject) return;

    async function loadJournalMatrix() {
      setLoading(true);
      setError(null);
      try {
        const data = await ApiClient.journal.getMatrix(selectedGroup, selectedSubject);
        const sortedLessons = [...data.lessons].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setLessons(sortedLessons);
        setStudents(data.students);
      } catch (err) {
        console.error("Failed to load journal matrix:", err);
        setError("Не удалось загрузить журнал успеваемости.");
      } finally {
        setLoading(false);
      }
    }
    loadJournalMatrix();
  }, [selectedGroup, selectedSubject]);

  const handleRightClick = async (e: React.MouseEvent, studentId: string, lessonId: string, expelled: boolean) => {
    e.preventDefault();
    if (expelled) return;

    const currentGrade = students.find(s => s.id === studentId)?.grades[lessonId];
    updateLocalCell(studentId, lessonId, {
      id: currentGrade?.id || `temp-${Date.now()}`,
      value: null,
      markType: "ABSENCE",
      type: currentGrade?.type || "PRACTICE",
      comment: currentGrade?.comment || null
    });

    try {
      await ApiClient.journal.saveGrade({
        studentId,
        lessonId,
        value: null,
        markType: "ABSENCE",
        type: currentGrade?.type || "PRACTICE",
        comment: currentGrade?.comment || undefined
      });
    } catch (err) {
      console.error("Failed to save right click mark:", err);
      refreshMatrix();
    }
  };

  const handleMiddleClick = async (e: React.MouseEvent, studentId: string, lessonId: string, expelled: boolean) => {
    if (e.button !== 1) return;
    e.preventDefault();
    if (expelled) return;

    const currentGrade = students.find(s => s.id === studentId)?.grades[lessonId];
    updateLocalCell(studentId, lessonId, {
      id: currentGrade?.id || `temp-${Date.now()}`,
      value: null,
      markType: "DELAY",
      type: currentGrade?.type || "PRACTICE",
      comment: currentGrade?.comment || null
    });

    try {
      await ApiClient.journal.saveGrade({
        studentId,
        lessonId,
        value: null,
        markType: "DELAY",
        type: currentGrade?.type || "PRACTICE",
        comment: currentGrade?.comment || undefined
      });
    } catch (err) {
      console.error("Failed to save middle click mark:", err);
      refreshMatrix();
    }
  };

  const handleCellFocus = (studentId: string, lessonId: string) => {
    setActiveCell({ studentId, lessonId });
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTableCellElement>, studentId: string, lessonId: string, rowIdx: number, colIdx: number, expelled: boolean) => {
    if (expelled) return;

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      let targetRow = rowIdx;
      let targetCol = colIdx;

      if (e.key === "ArrowUp") targetRow--;
      if (e.key === "ArrowDown") targetRow++;
      if (e.key === "ArrowLeft") targetCol--;
      if (e.key === "ArrowRight") targetCol++;

      const nextCell = document.querySelector(`td[data-row="${targetRow}"][data-col="${targetCol}"]`) as HTMLElement;
      if (nextCell) {
        nextCell.focus();
      }
      return;
    }

    const isDigit = /^[0-9]$/.test(e.key);
    if (isDigit) {
      e.preventDefault();
      const val = e.key === "0" ? 10 : parseInt(e.key, 10);

      const currentGrade = students.find(s => s.id === studentId)?.grades[lessonId];
      updateLocalCell(studentId, lessonId, {
        id: currentGrade?.id || `temp-${Date.now()}`,
        value: val,
        markType: "PRESENCE",
        type: currentGrade?.type || "PRACTICE",
        comment: currentGrade?.comment || null
      });

      try {
        await ApiClient.journal.saveGrade({
          studentId,
          lessonId,
          value: val,
          markType: "PRESENCE",
          type: currentGrade?.type || "PRACTICE",
          comment: currentGrade?.comment || undefined
        });
      } catch (err) {
        console.error("Failed to save keyboard grade:", err);
        refreshMatrix();
      }
    }

    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      const currentGrade = students.find(s => s.id === studentId)?.grades[lessonId];
      if (!currentGrade) return;

      updateLocalCell(studentId, lessonId, null);

      try {
        await ApiClient.journal.saveGrade({
          studentId,
          lessonId,
          value: null,
          markType: "PRESENCE",
          type: "PRACTICE",
          comment: undefined
        });
      } catch (err) {
        console.error("Failed to clear cell grade:", err);
        refreshMatrix();
      }
    }
  };

  const refreshMatrix = async () => {
    if (!selectedGroup || !selectedSubject) return;
    try {
      const data = await ApiClient.journal.getMatrix(selectedGroup, selectedSubject);
      const sortedLessons = [...data.lessons].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setLessons(sortedLessons);
      setStudents(data.students);
    } catch (err) {
      console.error("Failed to refresh journal matrix:", err);
    }
  };

  const updateLocalCell = (studentId: string, lessonId: string, gradeCell: any) => {
    setStudents(prevStudents => {
      return prevStudents.map(student => {
        if (student.id === studentId) {
          return {
            ...student,
            grades: {
              ...student.grades,
              [lessonId]: gradeCell
            }
          };
        }
        return student;
      });
    });
  };

  const handleDoubleClick = (studentId: string, lessonId: string, studentRow: JournalStudentRow, lesson: JournalLesson) => {
    if (studentRow.status === "EXPELLED") return;

    const cell = studentRow.grades[lessonId];
    const formattedDate = new Date(lesson.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });

    setModalData({
      studentId,
      lessonId,
      studentName: `${studentRow.lastName} ${studentRow.firstName}`,
      lessonDate: formattedDate,
      value: cell?.value ? String(cell.value) : "",
      markType: cell?.markType || "PRESENCE",
      type: cell?.type || "PRACTICE",
      comment: cell?.comment || ""
    });
    setEditModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalData) return;

    setSaving(true);
    const parsedValue = modalData.value ? parseInt(modalData.value, 10) : null;

    if (parsedValue !== null && (parsedValue < 1 || parsedValue > 10)) {
      alert("Оценка должна быть от 1 до 10");
      setSaving(false);
      return;
    }

    try {
      await ApiClient.journal.saveGrade({
        studentId: modalData.studentId,
        lessonId: modalData.lessonId,
        value: parsedValue,
        markType: modalData.markType,
        type: modalData.type,
        comment: modalData.comment || undefined
      });

      const currentCell = students.find(s => s.id === modalData.studentId)?.grades[modalData.lessonId];
      updateLocalCell(modalData.studentId, modalData.lessonId, {
        id: currentCell?.id || `temp-${Date.now()}`,
        value: parsedValue,
        markType: modalData.markType,
        type: modalData.type,
        comment: modalData.comment || null
      });

      setEditModalOpen(false);
      setModalData(null);
    } catch (err) {
      console.error("Failed to save grade from modal:", err);
      alert("Ошибка при сохранении оценки");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonData.date) return;

    setSaving(true);
    try {
      const startTimeISO = new Date(`${newLessonData.date}T${newLessonData.startTime}:00.000Z`).toISOString();
      const endTimeISO = new Date(`${newLessonData.date}T${newLessonData.endTime}:00.000Z`).toISOString();

      await ApiClient.journal.createLesson({
        subjectId: selectedSubject,
        groupId: selectedGroup,
        date: newLessonData.date,
        startTime: startTimeISO,
        endTime: endTimeISO
      });

      setNewLessonModalOpen(false);
      setNewLessonData({
        date: "",
        startTime: "08:35",
        endTime: "10:05"
      });

      refreshMatrix();
    } catch (err) {
      console.error("Failed to create lesson:", err);
      alert("Не удалось добавить занятие");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Журнал успеваемости</h1>
          <p className="text-xs text-zinc-400">Проставление оценок, посещаемости и опозданий (10-балльная шкала)</p>
        </div>

        {}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300">
            <Users className="h-4 w-4 text-orange-400" />
            <span>Группа:</span>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {groups.map(g => (
                <option key={g.id} value={g.id} className="bg-[#09090b]">{g.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300">
            <BookOpen className="h-4 w-4 text-orange-400" />
            <span>Предмет:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id} className="bg-[#09090b]">{s.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setNewLessonModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-lg shadow-orange-600/20"
          >
            <Plus className="h-3.5 w-3.5" />
            Добавить занятие
          </button>
        </div>
      </div>

      {}
      <div className="p-4 bg-orange-950/15 border border-orange-500/20 text-orange-300 rounded-xl text-xs space-y-2 max-w-4xl">
        <h4 className="font-bold flex items-center gap-1.5 text-orange-400">
          <HelpCircle className="h-4 w-4" /> Быстрая справка по управлению журналом:
        </h4>
        <ul className="list-disc pl-4 space-y-1 font-medium text-zinc-400">
          <li><b className="text-zinc-200">Двойной клик на ячейку:</b> Открывает подробную форму выставления оценки и комментария.</li>
          <li><b className="text-zinc-200">Правый клик мыши:</b> Отмечает отсутствие студента (проставляет красную <span className="text-red-400 font-bold">Н</span>).</li>
          <li><b className="text-zinc-200">Клик колесиком мыши (средней кнопкой):</b> Отмечает опоздание студента (проставляет оранжевую <span className="text-yellow-500 font-bold">О</span>).</li>
          <li><b className="text-zinc-200">Клавиатура (1-9, 0 для 10):</b> Быстро выставляет соответствующую оценку в выбранную ячейку. <kbd className="bg-zinc-800 text-white px-1.5 py-0.5 rounded text-[10px]">Backspace</kbd> очищает ячейку.</li>
          <li><b className="text-zinc-200">Навигация:</b> Используйте клавиши-стрелочки для перемещения фокуса между ячейками.</li>
        </ul>
      </div>

      {}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : error ? (
        <div className="glass p-8 rounded-xl text-center text-red-400 flex items-center justify-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="glass rounded-xl border border-zinc-800 overflow-x-auto">
          <table className="journal-table w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/30">
                <th className="p-4 text-xs font-bold text-zinc-400 w-64 select-none">Студент</th>
                {lessons.map((lesson) => {
                  const date = new Date(lesson.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
                  return (
                    <th key={lesson.id} className="p-4 text-xs font-bold text-zinc-400 text-center select-none w-24">
                      {date}
                    </th>
                  );
                })}
                {lessons.length === 0 && (
                  <th className="p-4 text-xs font-bold text-zinc-500 select-none">Нет занятий</th>
                )}
              </tr>
            </thead>
            <tbody>
              {students.map((studentRow, rowIdx) => {
                const isExpelled = studentRow.status === "EXPELLED";

                return (
                  <tr
                    key={studentRow.id}
                    className={`border-b border-zinc-900/60 ${isExpelled ? "opacity-40 grayscale" : ""}`}
                  >
                    {}
                    <td className="p-4 text-xs font-semibold text-white select-none flex items-center gap-2">
                      <span>{studentRow.lastName} {studentRow.firstName} {studentRow.middleName}</span>
                      {studentRow.isNew && (
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Новый студент" />
                      )}
                    </td>

                    {}
                    {lessons.map((lesson, colIdx) => {
                      const cell = studentRow.grades[lesson.id];

                      let textToShow = "";
                      let cellClass = "text-zinc-500";

                      if (cell) {
                        if (cell.markType === "ABSENCE") {
                          textToShow = "Н";
                          cellClass = "text-red-400 font-bold bg-red-500/5";
                        } else if (cell.markType === "DELAY") {
                          textToShow = cell.value ? `О/${cell.value}` : "О";
                          cellClass = "text-yellow-500 font-bold bg-yellow-500/5";
                        } else if (cell.value) {
                          textToShow = String(cell.value);
                          if (cell.value >= 8) cellClass = "text-emerald-400 font-bold bg-emerald-500/5";
                          else if (cell.value >= 5) cellClass = "text-blue-400 font-bold bg-blue-500/5";
                          else cellClass = "text-orange-400 font-bold bg-orange-500/5";
                        } else {
                          textToShow = "•";
                          cellClass = "text-zinc-500 font-medium";
                        }
                      }

                      return (
                        <td
                          key={lesson.id}
                          tabIndex={isExpelled ? undefined : 0}
                          data-row={rowIdx}
                          data-col={colIdx}
                          onFocus={() => handleCellFocus(studentRow.id, lesson.id)}
                          onKeyDown={(e) => handleKeyDown(e, studentRow.id, lesson.id, rowIdx, colIdx, isExpelled)}
                          onContextMenu={(e) => handleRightClick(e, studentRow.id, lesson.id, isExpelled)}
                          onMouseDown={(e) => handleMiddleClick(e, studentRow.id, lesson.id, isExpelled)}
                          onDoubleClick={() => handleDoubleClick(studentRow.id, lesson.id, studentRow, lesson)}
                          className={`p-4 text-xs text-center border-l border-zinc-900/60 cursor-pointer select-none focus:outline-none focus:bg-orange-600/10 focus:ring-1 focus:ring-orange-500/50 relative ${cellClass} ${isExpelled ? "pointer-events-none" : ""}`}
                          title={cell?.comment ? `[${cell.type}]: ${cell.comment}` : undefined}
                        >
                          {textToShow}
                          {cell?.comment && (
                            <span className="absolute top-1 right-1 h-1 w-1 rounded-full bg-orange-400" />
                          )}
                        </td>
                      );
                    })}
                    {lessons.length === 0 && (
                      <td className="p-4 text-xs text-zinc-600 italic">Сначала добавьте занятия</td>
                    )}
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={lessons.length + 1} className="p-8 text-center text-xs text-zinc-500">
                    Студенты не найдены в группе
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {}
      {editModalOpen && modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-md rounded-xl border border-zinc-800 p-6 space-y-6 animate-in fade-in zoom-in duration-200">
            {}
            <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
              <div>
                <h3 className="text-sm font-bold text-white">Выставить оценку</h3>
                <p className="text-[10px] text-orange-400 font-medium mt-0.5">
                  {modalData.studentName} — {modalData.lessonDate}
                </p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 text-zinc-500 hover:text-white rounded-lg transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {}
            <form onSubmit={handleSaveModal} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Посещаемость</label>
                  <select
                    value={modalData.markType}
                    onChange={(e) => setModalData({ ...modalData, markType: e.target.value as MarkType, value: e.target.value !== "PRESENCE" ? "" : modalData.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="PRESENCE">Был (Присутствует)</option>
                    <option value="ABSENCE">Н (Отсутствует)</option>
                    <option value="DELAY">О (Опоздал)</option>
                  </select>
                </div>

                {}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Оценка (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    disabled={modalData.markType === "ABSENCE"}
                    value={modalData.value}
                    onChange={(e) => setModalData({ ...modalData, value: e.target.value })}
                    placeholder="—"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500 disabled:opacity-40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Тип работы</label>
                  <select
                    value={modalData.type}
                    onChange={(e) => setModalData({ ...modalData, type: e.target.value as WorkType })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="PRACTICE">Практика</option>
                    <option value="LAB">Лабораторная работа</option>
                    <option value="TEST">Тест / Контрольная</option>
                    <option value="THEORY">Теория / Опрос</option>
                    <option value="EXAM">Экзамен</option>
                  </select>
                </div>
              </div>

              {}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Комментарий</label>
                <textarea
                  value={modalData.comment}
                  onChange={(e) => setModalData({ ...modalData, comment: e.target.value })}
                  placeholder="Добавьте отзыв или причину пропуска..."
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              {}
              <div className="flex gap-3 pt-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-lg shadow-orange-600/20 disabled:opacity-50"
                >
                  {saving ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {newLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-md rounded-xl border border-zinc-800 p-6 space-y-6 animate-in fade-in zoom-in duration-200">
            {}
            <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
              <div>
                <h3 className="text-sm font-bold text-white">Добавить занятие</h3>
                <p className="text-[10px] text-orange-400 font-medium mt-0.5">
                  Создание нового столбца занятий в журнале
                </p>
              </div>
              <button
                onClick={() => setNewLessonModalOpen(false)}
                className="p-1 text-zinc-500 hover:text-white rounded-lg transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {}
            <form onSubmit={handleCreateLesson} className="space-y-4">
              {}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Дата проведения
                </label>
                <input
                  type="date"
                  required
                  value={newLessonData.date}
                  onChange={(e) => setNewLessonData({ ...newLessonData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Начало пары
                  </label>
                  <input
                    type="time"
                    required
                    value={newLessonData.startTime}
                    onChange={(e) => setNewLessonData({ ...newLessonData, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Окончание пары
                  </label>
                  <input
                    type="time"
                    required
                    value={newLessonData.endTime}
                    onChange={(e) => setNewLessonData({ ...newLessonData, endTime: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {}
              <div className="flex gap-3 pt-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setNewLessonModalOpen(false)}
                  className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-lg shadow-orange-600/20 disabled:opacity-50"
                >
                  {saving ? "Создание..." : "Добавить столбец"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

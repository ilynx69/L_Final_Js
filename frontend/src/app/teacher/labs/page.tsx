"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LabAssignment, LabSubmission } from "@/lib/types";
import { ApiClient } from "@/lib/api";
import { MockDatabase } from "@/lib/mockData";
import { FileText, ClipboardCheck, ArrowRight, Loader2 } from "lucide-react";

export default function TeacherLabsPage() {
  const [labs, setLabs] = useState<LabAssignment[]>([]);
  const [submissions, setSubmissions] = useState<LabSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const assignmentsData = await ApiClient.labs.getAssignments("subj-web");
        setLabs(assignmentsData);

        const subsData = MockDatabase.getSubmissions();
        setSubmissions(subsData);
      } catch (err) {
        console.error("Failed to load labs dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getStats = (labId: string) => {
    const labSubs = submissions.filter((s) => s.labAssignmentId === labId);
    const pendingCount = labSubs.filter((s) => s.status === "PENDING").length;
    const gradedCount = labSubs.filter((s) => s.status === "GRADED").length;
    return { total: labSubs.length, pending: pendingCount, graded: gradedCount };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Проверка лабораторных</h1>
        <p className="text-xs text-zinc-400">Список выданных заданий и сданных решений</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {labs.map((lab) => {
            const stats = getStats(lab.id);

            return (
              <div key={lab.id} className="glass p-6 rounded-xl border border-zinc-800 flex flex-col justify-between gap-6 relative overflow-hidden group">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-orange-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[9px] font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 uppercase tracking-wider">
                        {lab.isTeam ? "Командная" : "Индивидуальная"}
                      </span>
                      <h3 className="text-sm font-bold text-white leading-tight mt-1 truncate max-w-[200px]">
                        {lab.title}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 pt-4 text-xs font-semibold">
                    <div className="flex flex-col">
                      <span className="text-zinc-500 text-[10px] uppercase">На проверке</span>
                      <span className={`text-base font-bold ${stats.pending > 0 ? "text-yellow-400" : "text-zinc-400"}`}>
                        {stats.pending} работ
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-zinc-500 text-[10px] uppercase">Проверено</span>
                      <span className="text-base font-bold text-emerald-400">
                        {stats.graded} / {stats.total}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/teacher/labs/${lab.id}`}
                  className="flex items-center justify-center gap-1.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  Перейти к проверке <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

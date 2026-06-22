import React from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Sidebar - fixed left */}
      <Sidebar />

      {/* Main Content Area - padded left by sidebar width (64 / 16rem) */}
      <div className="pl-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

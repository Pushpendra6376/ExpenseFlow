import React from "react";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";

export function AppLayout({ children }) {
  return (
    <div className="min-h-screen gradient-bg">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen pb-24 lg:pb-8">
        <div className="max-w-5xl mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

//auth/auth-code/layout.tsx

import React from "react";
import { ModeToggle } from "@/components/ModeToggle";

export default function AuthCodeLayout({ 
  children 
}: Readonly<{ 
  children: React.ReactNode 
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto">
        {/* Header with mode toggle */}
        <div className="flex justify-end p-4">
          <ModeToggle />
        </div>

        {/* Main content */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-md space-y-8  dark:bg-slate-900 rounded-2xl shadow-lg">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
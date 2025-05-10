"use client"

import type { ReactNode } from "react"
import Link from "next/link"

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50 to-teal-50">
      {/* Header with Logo
      <header className="container mx-auto py-6">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-xl font-bold text-white">
              N
            </div>
            <span className="text-xl font-bold text-emerald-800">eptune</span>
          </Link>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto py-6">
        <div className="text-center text-sm text-emerald-600/70">
          <p className="mb-2">
            <span className="italic">&quot;The best investment you can make is in yourself.&quot;</span>
            <span className="ml-2 text-emerald-600/60">- Warren Buffett</span>
          </p>
          <p className="text-xs">
            Neptune © {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
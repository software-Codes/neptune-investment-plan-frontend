// src/app/page.tsx
"use client"

import React from 'react'
import { Header } from '@/components/layout/Header'

/**
 * Home page layout: includes Header and responsive main content area.
 */
export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Site header */}
      <Header />

      {/* Main content area grows to fill available space */}
      <main className="flex-grow w-full container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TODO: Replace with actual homepage content */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-emerald-700 mb-4">Welcome to Neptune</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your dashboard awaits. Use the navigation above to explore your account.
          </p>
        </div>
      </main>

      {/* Optional footer */}
      <footer className="w-full bg-gray-100 dark:bg-slate-800 py-4">
        <div className="container mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Neptune. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

// src/app/page.tsx
"use client"

import React from 'react'
import { Header } from '@/components/layout/Header'
import { ChartAreaInteractive } from '@/components/charts'
import HeroSection from '@/components/ui/hero-section'

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
        <HeroSection />

        <ChartAreaInteractive />
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

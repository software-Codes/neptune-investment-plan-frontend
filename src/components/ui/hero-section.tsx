"use client"

import React from 'react'
import WelcomeGreetings from './welcome-greetings'
import { useAuth } from '@/hooks/useAuth'

/**
 * Hero section containing personalized greeting and quick actions.
 * Currently renders WelcomeGreetings; extend with other sub-components.
 */
export default function HeroSection() {
  const { user } = useAuth()
  const fullName = user?.full_name || 'User'

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid justify-center  grid-cols-1 sm:grid-cols-2 gap-6">
        <WelcomeGreetings fullName={fullName} />
        {/* Future components: PortfolioValue, Earnings, QuickActions */}
      </div>
    </section>
  )
}
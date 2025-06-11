"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import PortfolioValue from './PortfolioValue'
import DailyEarnings from './DailyEarnings'
import QuickActions from './QuickActions'
import { Loader2 } from 'lucide-react'
import { UserProfile } from '@/types/types'
import WelcomeGreetings from './welcome-greetings'

/**
 * Hero section containing greeting, portfolio overview, earnings, and quick actions.
 */
export default function HeroSection() {
  const { user, isLoading, getCurrentUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      getCurrentUser()
        .then((data) => setProfile(data))
        .catch((err) => console.error('Failed to load profile', err))
        .finally(() => setLoadingProfile(false))
    }
  }, [isLoading, getCurrentUser])

  if (isLoading || loadingProfile) {
    return (
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="animate-spin h-8 w-8 text-emerald-600" />
        </div>
      </section>
    )
  }

  const fullName = user?.full_name || 'Investor'
  const total = profile?.wallets.reduce(
    (sum, w) => sum + parseFloat(w.balance) + (w.locked_balance ? parseFloat(w.locked_balance) : 0),
    0
  ) || 0

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <WelcomeGreetings fullName={fullName} />
          <PortfolioValue totalValue={total} />
        </div>
        <DailyEarnings wallets={profile?.wallets || []} />
      </div>
      {/* Quick Actions Row */}
      <div className="mt-6">
        <QuickActions />
      </div>
    </section>
  )
}

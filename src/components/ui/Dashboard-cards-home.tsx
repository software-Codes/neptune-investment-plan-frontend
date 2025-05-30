/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'
import { UserProfile } from '@/types/types'
import WalletBalancesCard from './WalletBalancesCard'

const DashboardSectionHomePage = () => {
    const {user, isLoading, getCurrentUser} =  useAuth();
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
    const handleTransfer = (walletId: string) => {
    console.log(`Initiate transfer for wallet ${walletId}`)
    // e.g. router.push(`/transfer/${walletId}`)
  }
    if (isLoading || loadingProfile) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="animate-spin h-8 w-8 text-emerald-600" />
      </div>
    )
  }

    
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      {profile?.wallets.length ? (
        <WalletBalancesCard wallets={profile.wallets} onTransfer={handleTransfer} />
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No wallets available.
        </p>
      )}
    </div>
  )
}

export default DashboardSectionHomePage

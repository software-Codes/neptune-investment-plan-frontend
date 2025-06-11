// src/components/dashboard/ActiveInvestmentsSummary.tsx
"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { UserProfile } from '@/types/types'

interface ActiveInvestmentsSummaryProps {
  profile: UserProfile
}

/**
 * Displays summary of active investments, including total count,
 * daily return percentage, and next compound date.
 */
export default function ActiveInvestmentsSummary({ profile }: ActiveInvestmentsSummaryProps) {
  // Example data: map investments to chart data
  const data = profile.wallets.map((w) => ({
    name: w.wallet_type,
    value: parseFloat(w.balance),
  }))

  // Placeholder values; replace with real data when available
  const dailyReturn = 0.25 // percent
  const nextCompoundDate = new Date()
  nextCompoundDate.setDate(nextCompoundDate.getDate() + 1)

  return (
    <Card className="w-full bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-6">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Active Investments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Investments</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {profile.wallets.length}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">Daily Return</p>
            <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
              {dailyReturn}%
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">Next Compound</p>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {nextCompoundDate.toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <XAxis dataKey="name" stroke="#888888" />
              <YAxis stroke="#888888" />
              <Tooltip />
              <Bar dataKey="value" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

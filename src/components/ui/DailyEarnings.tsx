"use client "
import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import { UserProfile } from '@/types/types'

interface DailyEarningsProps 
{
    wallets: UserProfile['wallets']
}

/**
 * Displays today's earnings per wallet (currently shows wallet balances).
 * Responsive and styled consistently with theme.
 */

export default function DailyEarnings({wallets}: DailyEarningsProps)
{
    return(
            <Card className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow hover:shadow-lg transition p-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Today&apos;s Earnings
          </CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
            </TooltipTrigger>
            <TooltipContent>
              Currently showing wallet balances as earnings placeholder
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {wallets.map((w) => (
            <li key={w.wallet_id} className="flex justify-between text-sm sm:text-base">
              <span className="capitalize text-gray-600 dark:text-gray-300">{w.wallet_type}</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {parseFloat(w.balance).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
    )
}
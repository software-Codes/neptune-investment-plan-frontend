/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PortfolioValueProps 
{
    totalValue: number
}

export default function PortfolioValue({totalValue}: PortfolioValueProps)
{
    const formatted = totalValue.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        // minimumFractionDigits: 2,
        // maximumFractionDigits: 2
    })

  return (
    <Card className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow hover:shadow-lg transition p-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Total Amounts For All your wallets
          </CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-gray-400 hover:text-green-600 dark:text-gray-500 dark:hover:text-green-300" />
            </TooltipTrigger>
            <TooltipContent>
              Sum of all your wallet balances
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mt-2 text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
          {formatted}
        </p>
      </CardContent>
    </Card>
  )

}
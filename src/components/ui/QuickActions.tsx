"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, TrendingUp, ArrowDownCircle } from 'lucide-react'
/**
 * Quick action buttons for Deposit, Invest, and Withdraw.
 * Responsive grid layout with theming.
 */
export default function QuickActions()
{
      const actions = [
    { name: 'Deposit', icon: PlusCircle, onClick: () => {/* navigate to deposit */} },
    { name: 'Invest', icon: TrendingUp, onClick: () => {/* navigate to invest */} },
    { name: 'Withdraw', icon: ArrowDownCircle, onClick: () => {/* navigate to withdraw */} },
  ]
    return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
      {actions.map((action) => (
        <Button
          key={action.name}
          onClick={action.onClick}
          className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-green-600 to-yellow-400 text-white hover:from-green-700 hover:to-yellow-500 shadow-lg transition rounded-2xl"
        >
          <action.icon className="h-5 w-5" />
          <span className="font-semibold">{action.name}</span>
        </Button>
      ))}
    </div>
  )
}
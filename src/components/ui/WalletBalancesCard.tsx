// src/components/dashboard/WalletBalancesCard.tsx
"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Wallet } from '@/types/types'
import { Button } from '@/components/ui/button'
import { Banknote, ArrowRightLeft, Wallet as WalletIcon, TrendingUp, Gift } from 'lucide-react'

interface WalletBalancesCardProps {
  wallets: Wallet[]
  onTransfer: (walletId: string) => void
}

/**
 * Displays balances for each wallet type with a transfer action.
 * Responsive 3-column grid, theming, and interactive buttons.
 */
export const WalletBalancesCard: React.FC<WalletBalancesCardProps> = ({ wallets, onTransfer }) => {
  // Helper to choose icon per wallet type
  const getIcon = (type: string) => {
    switch (type) {
      case 'account': return <WalletIcon className="h-6 w-6 text-emerald-600" />
      case 'trading': return <TrendingUp className="h-6 w-6 text-blue-500" />
      case 'referral': return <Gift className="h-6 w-6 text-yellow-500" />
      default: return <Banknote className="h-6 w-6 text-gray-400" />
    }
  }

  return (
    <Card className="w-full bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-semibold text-gray-800 dark:text-gray-100">
          <WalletIcon className="h-6 w-6 text-emerald-600" />
          Wallet Balances
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet) => {
            const balance = parseFloat(wallet.balance)
            const locked = wallet.locked_balance ? parseFloat(wallet.locked_balance) : 0
            const formattedBalance = balance.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
            const formattedLocked = locked.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
            return (
              <div
                key={wallet.wallet_id}
                className="flex flex-col justify-between bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 capitalize">
                      {wallet.wallet_type} Wallet
                    </h3>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {formattedBalance}
                    </p>
                    {locked > 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Locked: {formattedLocked}
                      </p>
                    )}
                  </div>
                  <div>{getIcon(wallet.wallet_type)}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTransfer(wallet.wallet_id)}
                  className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-emerald-600 border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Transfer
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default WalletBalancesCard

import WalletBalancesCard from '@/components/ui/WalletBalancesCard'
import React from 'react'

const UserWalletPage = () => {
  return (
    <div>
      <h1>Wallet</h1>
      {/* <WalletBalancesCard wallets={[]} onTransfer={() => {}} /> */}
      <WalletBalancesCard wallets={[]} onTransfer={() => {}} />
    </div>
  )
}

export default UserWalletPage

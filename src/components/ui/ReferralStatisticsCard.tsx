import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserProfile } from '@/types/types'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ReferralStatisticsProps {
  profile: UserProfile
}


const ReferralStatisticsCard: React.FC<ReferralStatisticsProps> = ({ profile }) => {
 const referralCode = profile.user_id?.slice(0, 6).toUpperCase() || '------'
  const totalReferrals = 0 // Placeholder until backend integration
  const referralEarnings = 0 // Placeholder until backend integration


  const handleCopy =() =>
  {
    navigator.clipboard.writeText(referralCode)
    toast.success('Referal code has been copied to the clipnoard')
  }
  return (
    <Card className="w-full shadow-md border dark:border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Referral Statistics</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Referral Code</span>
          <div className="flex items-center space-x-2 mt-1">
            <span className="font-medium text-lg">{referralCode}</span>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Total Referrals</span>
          <span className="font-medium text-lg mt-1">{totalReferrals}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Earnings from Referrals</span>
          <span className="font-medium text-lg mt-1">${referralEarnings.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default ReferralStatisticsCard

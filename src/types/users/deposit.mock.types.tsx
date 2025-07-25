// Mock data for user deposits in a TRC20 network
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'

export const mockDeposits = [
  {
 id: "dep_1234567890",
    userId: "user_123",
    amount: 1000.00,
    currency: "USDT" as const,
    txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    status: "confirmed",
    confirmations: 12,
    blockHeight: 12345678,
    createdAt: "2024-06-12T10:30:00Z",
    confirmationTimestamp: "2024-06-12T10:45:00Z",
    network: "TRC20",
    creditedAmount: 1000.00,
    estimatedCompletion: "2024-06-12T11:00:00Z"
  },
  {
 id: "dep_0987654321",
    userId: "user_123",
    amount: 500.00,
    currency: "USDT" as const,
    txHash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
    status: "pending",
    confirmations: 2,
    blockHeight: 12345679,
    createdAt: "2024-06-12T11:00:00Z",
    network: "TRC20",
    estimatedCompletion: "2024-06-12T11:30:00Z"
  },
  {
    id: "dep_5555555555",
    userId: "user_123",
    amount: 750.00,
    currency: "USDT" as const,
    txHash: "0x5555555555555555555555555555555555555555555555555555555555555555",
    status: "failed",
    confirmations: 0,
    blockHeight: 0,
    createdAt: "2024-06-12T09:00:00Z",
    network: "TRC20",
    failureReason: "Insufficient blockchain confirmations"
  },
  // {
  //   id: 'dep_004',
  //   amount: 50.0,
  //   transactionHash: '0x5555666677778888999900001111222233334444',
  //   status: 'confirmed',
  //   createdAt: '2024-06-07T16:45:00Z',
  //   confirmedAt: '2024-06-07T17:00:00Z',
  //   network: 'TRC20',
  // },
  // {
  //   id: 'dep_005',
  //   amount: 25.0,
  //   transactionHash: '0x1111222233334444555566667777888899990000',
  //   status: 'confirmed',
  //   createdAt: '2024-06-06T11:20:00Z',
  //   confirmedAt: '2024-06-06T11:35:00Z',
  //   network: 'TRC20',
  // },
  // {
  //   id: 'dep_006',
  //   amount: 120.0,
  //   transactionHash: '0xaaaa1111bbbb2222cccc3333dddd4444eeee5555',
  //   status: 'confirmed',
  //   createdAt: '2024-06-05T09:10:00Z',
  //   confirmedAt: '2024-06-05T09:25:00Z',
  //   network: 'TRC20',
  // },
]

export const mockStats = {
  totalDeposited: 475.5,
  successfulDeposits: 3,
  pendingDeposits: 1,
  averageAmount: 118.88,
}

export const getStatusConfig = (status: string) => {
  switch (status) {
    case 'confirmed':
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        icon: CheckCircle,
      }
    case 'pending':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: Clock,
      }
    case 'failed':
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        icon: XCircle,
      }
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-700',
        icon: AlertCircle,
      }
  }
}

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ElementType
  variant?: string
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
      case 'primary':
        return 'border-green-200 dark:border-green-800 bg-white dark:bg-gray-800'
      default:
        return 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
    }
  }

  return (
    <div className={`p-6 rounded-lg border ${getVariantStyles()}`}>
      <div className='flex items-center gap-3'>
        <Icon className='h-8 w-8 text-green-600 dark:text-green-400' />
        <div>
          <h3 className='text-2xl font-bold text-gray-900 dark:text-white'>{value}</h3>
          <p className='font-medium text-gray-700 dark:text-gray-300'>{title}</p>
        </div>
      </div>
      <div className='mt-2'>
        <p className='text-sm text-gray-500 dark:text-gray-400'>{subtitle}</p>
      </div>
    </div>
  )
}
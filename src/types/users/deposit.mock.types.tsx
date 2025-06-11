//mock data for user deposits in a TRC20 network

import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

export const mockDeposits = [
  {
    id: "dep_001",
    amount: 150.0,
    transactionHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
    status: "confirmed",
    createdAt: "2024-06-10T08:30:00Z",
    confirmedAt: "2024-06-10T08:45:00Z",
    network: "TRC20",
  },
  {
    id: "dep_002",
    amount: 75.5,
    transactionHash: "0x9876543210fedcba0987654321abcdef09876543",
    status: "pending",
    createdAt: "2024-06-09T14:20:00Z",
    network: "TRC20",
  },
  {
    id: "dep_003",
    amount: 200.0,
    transactionHash: "0xabcdef1234567890fedcba0987654321fedcba09",
    status: "failed",
    createdAt: "2024-06-08T10:15:00Z",
    failedAt: "2024-06-08T10:30:00Z",
    network: "TRC20",
  },
  {
    id: "dep_004",
    amount: 50.0,
    transactionHash: "0x5555666677778888999900001111222233334444",
    status: "confirmed",
    createdAt: "2024-06-07T16:45:00Z",
    confirmedAt: "2024-06-07T17:00:00Z",
    network: "TRC20",
  },

    {
    id: "dep_004",
    amount: 50.0,
    transactionHash: "0x5555666677778888999900001111222233334444",
    status: "confirmed",
    createdAt: "2024-06-07T16:45:00Z",
    confirmedAt: "2024-06-07T17:00:00Z",
    network: "TRC20",
  },
    {
    id: "dep_004",
    amount: 50.0,
    transactionHash: "0x5555666677778888999900001111222233334444",
    status: "confirmed",
    createdAt: "2024-06-07T16:45:00Z",
    confirmedAt: "2024-06-07T17:00:00Z",
    network: "TRC20",
  },
];
export const mockStats = {
  totalDeposited: 475.5,
  successfulDeposits: 3,
  pendingDeposits: 1,
  averageAmount: 118.88,
};

export const getStatusConfig = (status: string) => {
  switch (status) {
    case "confirmed":
      return {
        bg: "bg-green-50 dark:bg-green-900/20",
        text: "text-green-700 dark:text-green-400",
        border: "border-green-200 dark:border-green-800",
        icon: CheckCircle,
      };  
    case "pending":
      return {
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
        text: "text-yellow-700 dark:text-yellow-400",
        border: "border-yellow-200 dark:border-yellow-800",
        icon: Clock,
      };
    case "failed":
      return {
        bg: "bg-red-50 dark:bg-red-900/20",
        text: "text-red-700 dark:text-red-400",
        border: "border-red-200 dark:border-red-800",
        icon: XCircle,
      };
    default:
      return {
        bg: "bg-gray-50 dark:bg-gray-800",
        text: "text-gray-700 dark:text-gray-300",
        border: "border-gray-200 dark:border-gray-700",
        icon: AlertCircle,
      };
  }
};

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  variant?: string;
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20";
      case "warning":
        return "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20";
      case "primary":
        return "border-green-200 dark:border-green-800 bg-white dark:bg-gray-800";
      default:
        return "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800";
    }
  };

  return (
    <div className={`p-6 rounded-lg border ${getVariantStyles()}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
};

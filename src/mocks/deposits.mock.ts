// src/mocks/deposits.mock.ts
// -----------------------------------------------------------------------------
// Mock seed‑data for the deposits feature.
// This file is ONLY imported by the front‑end during local development and tests.
// Remove or switch to MSW once the real API is online.
// -----------------------------------------------------------------------------
import { Deposit, DepositCurrency, DepositNetwork, DepositStatus } from "@/types/deposits.types";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { Sumana } from "next/font/google";
/**
 * A handful of fake deposits that exercise every status branch so that we can
 * develop the UI without hitting the real backend.
 */


export const mockDeposits: Deposit[] = [
  {
    id: "dep_0001",
    userId: "user_123",
    amount: 1000,
    currency: "USDT" as DepositCurrency,
    txHash: "0x4d6c6b5cd6b33a1f8d3f726031f6f4f9bff2cbe4d9f257a97dfb3456339be100",
    status: "confirmed" as DepositStatus,
    confirmations: 12,
    blockHeight: 33456789,
    createdAt: "2025-06-10T08:00:00Z",
    confirmationTimestamp: "2025-06-10T08:12:00Z",
    estimatedCompletion: "2025-06-10T08:15:00Z",
    creditedAmount: 1000,
    network: "TRC20" as DepositNetwork,
  },
  {
    id: "dep_0002",
    userId: "user_123",
    amount: 500,
    currency: "USDT" as DepositCurrency,
    txHash: "0xd72d8899e174cd88eab73d3d0c4418b6c7f4d613f0a4e2007e9d52e1968f0c02",
    status: "pending" as DepositStatus,
    confirmations: 1,
    blockHeight: 33789201,
    createdAt: "2025-06-11T14:30:00Z",
    estimatedCompletion: "2025-06-11T15:00:00Z",
    network: "TRC20" as DepositNetwork,
  },
  {
    id: "dep_0003",
    userId: "user_123",
    amount: 750,
    currency: "USDT" as DepositCurrency,
    txHash: "0x0e4bcdf8f2d48b70b7fb61b8e7258e64ccad0af2e073de33c1ad13918b45a8ff",
    status: "failed" as DepositStatus,
    confirmations: 0,
    blockHeight: 0,
    createdAt: "2025-06-09T09:15:00Z",
    network: "TRC20" as DepositNetwork,
    failureReason: "Insufficient network confirmations – tx dropped",
  },
  {
    id: "dep_0004",
    userId: "user_123",
    amount: 2500,
    currency: "USDT" as DepositCurrency,
    txHash: "0x1a2b3c4d5e6f7890abcdef1234567890fedcba0987654321abcdef1234567890",
    status: "confirmed" as DepositStatus,
    confirmations: 25,
    blockHeight: 33456790,
    createdAt: "2025-06-08T16:22:00Z",
    confirmationTimestamp: "2025-06-08T16:35:00Z",
    creditedAmount: 2500,
    network: "TRC20" as DepositNetwork,
  },
  {
    id: "dep_0005",
    userId: "user_123",
    amount: 150,
    currency: "USDT" as DepositCurrency,
    txHash: "0x9876543210fedcba0987654321abcdef1234567890abcdef1234567890fedcba",
    status: "pending" as DepositStatus,
    confirmations: 2,
    blockHeight: 33789250,
    createdAt: "2025-06-12T10:15:00Z",
    estimatedCompletion: "2025-06-12T10:45:00Z",
    network: "TRC20" as DepositNetwork,
  },
];
// -----------------------------------------------------------------------------
// Aggregated stats – the dashboard components consume these directly. They are
// recalculated here so the source of truth is ONE place.
// -----------------------------------------------------------------------------

const totalDeposited = mockDeposits
  .filter((d) => d.status === "confirmed")
  .reduce((sum, d) => sum + d.amount, 0);

const successfulDeposits = mockDeposits.filter(
  (d) => d.status === "confirmed"
).length;
const pendingDeposits = mockDeposits.filter(
  (d) => d.status === "pending"
).length;
const averageAmount =
  mockDeposits.length > 0
    ? mockDeposits.reduce((sum, d) => sum + d.amount, 0) / mockDeposits.length
    : 0;

export const mockStats = {
  totalDeposited,
  successfulDeposits,
  pendingDeposits,
  averageAmount: Number(averageAmount.toFixed(2)),
};

// -----------------------------------------------------------------------------
// UI helper – maps a status string to Tailwind classes & icon for the StatusBadge
// component. Keeping it here avoids circular imports between UI and data.
// -----------------------------------------------------------------------------

export type StatusConfig = {
  bg: string;
  text: string;
  border: string;
  icon: typeof CheckCircle;
  description: string;
};

export const getStatusConfig = (status: DepositStatus): StatusConfig => {
  switch (status) {
    case "confirmed":
      return {
        bg: "bg-green-50 dark:bg-green-950/50",
        text: "text-green-700 dark:text-green-400",
        border: "border-green-200 dark:border-green-800",
        icon: CheckCircle,
description: "Your deposit has been confirmed and credited to your account"
      };
    case "pending":
      return {
        bg: "bg-yellow-50 dark:bg-yellow-950/50",
        text: "text-yellow-700 dark:text-yellow-400",
        border: "border-yellow-200 dark:border-yellow-800",
        icon: Clock,
        description: "Your deposit is pending confirmation" 
      };
    case "failed":
      return {
        bg: "bg-red-50 dark:bg-red-950/50",
        text: "text-red-700 dark:text-red-400",
        border: "border-red-200 dark:border-red-800",
        icon: XCircle,
        description: "Your deposit has failed and will not be credited"
      };
    default:
      return {
        bg: "bg-gray-50 dark:bg-gray-950/50",
        text: "text-gray-700 dark:text-gray-400",
        border: "border-gray-200 dark:border-gray-800",
        icon: AlertCircle,
        description: "Unknown status"
      };
  }
};

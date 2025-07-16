/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Copy,
  ExternalLink,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  Shield,
  Globe,
  Calendar,
  Hash,
  DollarSign,
  RefreshCw,
  MessageSquare,
  Ban
} from "lucide-react";
import { getStatusConfig, mockDeposits } from "@/mocks/deposits.mock";
import { Deposit } from "@/types/deposits.types";
import { useParams, useRouter } from "next/navigation";
// Mock types and data (simulating your actual types)
type DepositStatus = "pending" | "confirmed" | "failed";


// StatusBadge Component
const StatusBadge = ({ status, showDescription = false }: { status: DepositStatus; showDescription?: boolean }) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3">
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <Icon className="w-4 h-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
      {showDescription && (
        <span className="text-sm text-muted-foreground">
          {config.description}
        </span>
      )}
    </div>
  );
};

// Timeline Component
const Timeline = ({ deposit }: { deposit: Deposit }) => {
  // Define the TimelineStep type
  type IconComponent = React.ComponentType<{ className?: string }>;
  type TimelineStep = {
    id: string;
    label: string;
    description: string;
    completed: boolean;
    timestamp: string | undefined;
    icon: IconComponent;
    progress?: string;
    failed?: boolean;
  };
  
  const getTimelineSteps = () => {
      const steps: TimelineStep[] = [
      {
        id: 'initiated',
        label: 'Deposit Initiated',
        description: 'Deposit request created',
        completed: true,
        timestamp: deposit.createdAt,
        icon: DollarSign
      },
      {
        id: 'hash_submitted',
        label: 'Transaction Hash Submitted',
        description: 'Transaction broadcasted to blockchain',
        completed: !!deposit.txHash,
        timestamp: deposit.txHash ? deposit.createdAt : undefined,
        icon: Hash
      },
      {
        id: 'blockchain_confirmation',
        label: 'Blockchain Confirmation',
        description: `Requires ${deposit.network === 'TRC20' ? '1' : '12'} confirmations`,
        completed: deposit.confirmations > 0,
        timestamp: deposit.confirmations > 0 ? deposit.createdAt : undefined,
        icon: Globe,
        progress: deposit.status === 'pending' ? `${deposit.confirmations}/1` : undefined
      },
      {
        id: 'verification',
        label: 'Security Verification',
        description: 'Admin verification and security checks',
        completed: deposit.status !== 'pending',
        timestamp: deposit.confirmationTimestamp,
        icon: Shield
      },
      {
        id: 'credited',
        label: 'Funds Credited',
        description: 'Amount added to your account balance',
        completed: deposit.status === 'confirmed',
        timestamp: deposit.confirmationTimestamp,
        icon: CheckCircle
      }
    ];

    // Mark failed steps
    if (deposit.status === 'failed') {
      const failedIndex = steps.findIndex(step => !step.completed);
      if (failedIndex !== -1) {
        steps[failedIndex] = {
          ...steps[failedIndex],
          failed: true,
          icon: XCircle
        };
      }
    }

    return steps;
  };

  const steps = getTimelineSteps();

  return (
    <div className="space-y-6">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isLast = index === steps.length - 1;
        const isFailed = (step as any).failed;

        return (
          <div key={step.id} className="relative flex items-start gap-4">
            {/* Timeline line */}
            {!isLast && (
              <div className={`absolute left-4 top-8 w-0.5 h-16 ${step.completed && !isFailed ? 'bg-green-300' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
            )}

            {/* Icon */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${isFailed
                ? 'bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800'
                : step.completed
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800'
                  : 'bg-gray-50 border-gray-200 dark:bg-gray-950/50 dark:border-gray-700'
              }`}>
              <Icon className={`w-4 h-4 ${isFailed
                  ? 'text-red-600 dark:text-red-400'
                  : step.completed
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-medium ${isFailed
                    ? 'text-red-700 dark:text-red-400'
                    : step.completed
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                  {step.label}
                </h3>
                {step.progress && (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded">
                    {step.progress}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {step.description}
              </p>
              {step.timestamp && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(step.timestamp).toLocaleString("en-KE", {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Copy Button Component
const CopyButton = ({ text, label = "Copy" }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopy = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={loading}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors disabled:opacity-50"
      title={label}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : copied ? (
        <>
          <CheckCircle className="w-3 h-3 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          {label}
        </>
      )}
    </button>
  );
};

// Main Component
export default function DepositDetailPage() {
  const [deposit, setDeposit] = useState<Deposit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Mock params - in real app this would come from useParams
  const depositId = "dep_0001"; // Change this to test different deposits
  const params = useParams();
  const userId  = params.userId;

  const router = useRouter();

  const fetchDeposit = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find mock deposit
      const foundDeposit = mockDeposits.find(d => d.id === depositId);
      if (!foundDeposit) {
        throw new Error('Deposit not found');
      }

      setDeposit(foundDeposit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deposit');
      // Fallback to first mock deposit
      setDeposit(mockDeposits[0]);
    } finally {
      setLoading(false);
    }
  }, [depositId]);

  useEffect(() => {
    fetchDeposit();
  }, [fetchDeposit]);

  const handleAction = async (action: string) => {
    setActionLoading(action);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Action: ${action}`);
    setActionLoading(null);
  };

  const handleBack = () => {
    console.log('Navigate back to deposits list');
 router.push(`/${userId}/deposits`)
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading deposit details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !deposit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load Deposit</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchDeposit}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!deposit) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getBlockchainUrl = (hash: string) => {
    return deposit.network === 'TRC20'
      ? `https://tronscan.io/#/transaction/${hash}`
      : `https://etherscan.io/tx/${hash}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          title="Back to deposits"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Deposit Details</h1>
          <p className="text-muted-foreground">ID: {deposit.id}</p>
        </div>
      </div>

      {/* Status Alert */}
      <div className={`p-4 rounded-lg border ${getStatusConfig(deposit.status).bg} ${getStatusConfig(deposit.status).border}`}>
        <StatusBadge status={deposit.status} showDescription={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Deposit Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Amount</label>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(deposit.amount)}
                </p>
                <p className="text-sm text-muted-foreground">{deposit.currency}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Network</label>
                <p className="text-lg font-semibold">{deposit.network}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">
                  {new Date(deposit.createdAt).toLocaleString("en-KE", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Confirmations</label>
                <p className="text-lg font-semibold">{deposit.confirmations}</p>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          {deposit.txHash && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Transaction Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Transaction Hash</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
                      {deposit.txHash}
                    </code>
                    <CopyButton text={deposit.txHash} />
                    <a
                      href={getBlockchainUrl(deposit.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                      title="View on blockchain explorer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Explorer
                    </a>
                  </div>
                </div>

                {deposit.blockHeight > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Block Height</label>
                    <p className="font-mono text-sm">{deposit.blockHeight.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status-specific Information */}
          {deposit.status === 'confirmed' && deposit.creditedAmount && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                Deposit Confirmed ✓
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Credited Amount:</span> {formatCurrency(deposit.creditedAmount)}
                </p>
                {deposit.confirmationTimestamp && (
                  <p>
                    <span className="font-medium">Confirmed At:</span>{' '}
                    {new Date(deposit.confirmationTimestamp).toLocaleString("en-KE")}
                  </p>
                )}
              </div>
            </div>
          )}

          {deposit.status === 'failed' && deposit.failureReason && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h3 className="font-semibold text-red-800 dark:text-red-400 mb-2">
                Deposit Failed
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                {deposit.failureReason}
              </p>
            </div>
          )}

          {deposit.status === 'pending' && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                Processing Your Deposit
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                Your deposit is being processed on the blockchain. This usually takes a few minutes.
              </p>
              {deposit.estimatedCompletion && (
                <p className="text-sm">
                  <span className="font-medium">Estimated Completion:</span>{' '}
                  {new Date(deposit.estimatedCompletion).toLocaleString("en-KE")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Progress Timeline
            </h3>
            <Timeline deposit={deposit} />
          </div>

          {/* Actions */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleAction('contact_support')}
                disabled={actionLoading === 'contact_support'}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
              >
                {actionLoading === 'contact_support' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
                Contact Support
              </button>

              {deposit.status === 'pending' && (
                <button
                  onClick={() => handleAction('cancel_deposit')}
                  disabled={actionLoading === 'cancel_deposit'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading === 'cancel_deposit' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Ban className="w-4 h-4" />
                  )}
                  Cancel Deposit
                </button>
              )}

              {deposit.status === 'failed' && (
                <button
                  onClick={() => handleAction('retry_deposit')}
                  disabled={actionLoading === 'retry_deposit'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {actionLoading === 'retry_deposit' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Retry Deposit
                </button>
              )}

              {deposit.status === 'pending' && (
                <button
                  onClick={fetchDeposit}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Refresh Status
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
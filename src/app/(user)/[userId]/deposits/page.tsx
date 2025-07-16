"use client";
import React, { useState, useMemo } from "react";
import { 
  Search, 
  Plus, 
  Copy, 
  ExternalLink, 
  Filter, 
  ChevronDown, 
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Deposit, DepositStatus } from "@/types/deposits.types";
import { getStatusConfig, mockDeposits } from "@/types/users/deposit.mock.types";
import { useRouter } from "next/navigation";



// StatusBadge Component
const StatusBadge = ({ status }: { status: DepositStatus }) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// DepositRow Component
function DepositRow({ deposit, onView }: { deposit: Deposit; onView: (id: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!deposit.txHash || copyLoading) return;
    
    setCopyLoading(true);
    try {
      await navigator.clipboard.writeText(deposit.txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    } finally {
      setCopyLoading(false);
    }
  };

  const handleExternalLink = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-KE", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  };

  return (
    <div
      onClick={() => onView(deposit.id)}
      className="group bg-card border border-border rounded-lg p-4 hover:shadow-md hover:border-primary/50 cursor-pointer transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-foreground">
            ${deposit.amount.toLocaleString()} USDT
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            {deposit.network}
          </span>
        </div>
        <StatusBadge status={deposit.status} />
      </div>

      {/* Date */}
      <p className="text-sm text-muted-foreground mb-3">
        {formatDate(deposit.createdAt)}
      </p>

      {/* Transaction Hash */}
      {deposit.txHash && (
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-muted-foreground">
            {truncateHash(deposit.txHash)}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              disabled={copyLoading}
              className="p-1 hover:bg-muted rounded transition-colors"
              title="Copy transaction hash"
            >
              {copyLoading ? (
                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground hover:text-foreground" />
              )}
            </button>
            <a
              href={`https://tronscan.io/#/transaction/${deposit.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleExternalLink}
              className="p-1 hover:bg-muted rounded transition-colors"
              title="View on Tronscan"
            >
              <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-foreground" />
            </a>
          </div>
          {copied && (
            <span className="text-primary text-xs font-medium animate-fade-in">
              Copied!
            </span>
          )}
        </div>
      )}

      {/* Failure Reason */}
      {deposit.status === 'failed' && deposit.failureReason && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-400">
          {deposit.failureReason}
        </div>
      )}

      {/* Confirmations */}
      {deposit.status === 'pending' && (
        <div className="mt-2 text-xs text-muted-foreground">
          {deposit.confirmations} confirmation{deposit.confirmations !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

// Main Component
export default function DepositsPage() {
  const router = useRouter();
  const userId = "user_123"; // Mock user ID
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DepositStatus>("all");
  const [isLoading] = useState(false); // Simulate loading state

  // Filter deposits
  const filteredDeposits = useMemo(() => {
    return mockDeposits.filter((deposit) => {
      const matchesStatus = statusFilter === "all" || deposit.status === statusFilter;
      const matchesSearch = 
        deposit.txHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.amount.toString().includes(searchTerm) ||
        deposit.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [searchTerm, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalDeposited = mockDeposits
      .filter(d => d.status === "confirmed")
      .reduce((sum, d) => sum + d.amount, 0);
    
    const pendingCount = mockDeposits.filter(d => d.status === "pending").length;
    const confirmedCount = mockDeposits.filter(d => d.status === "confirmed").length;
    const failedCount = mockDeposits.filter(d => d.status === "failed").length;

    return { totalDeposited, pendingCount, confirmedCount, failedCount };
  }, []);

  const handleViewDeposit = (depositId: string) => {
    console.log('Viewing deposit:', depositId);
    router.push(`/${userId}/deposits/${depositId}`)
  };

  const handleNewDeposit = () => {
    console.log('Creating new deposit');
    router.push(`/${userId}/deposits/new`)
  };

  const nextFilterStatus = () => {
    if (statusFilter === "all") return "pending";
    if (statusFilter === "pending") return "confirmed";
    if (statusFilter === "confirmed") return "failed";
    return "all";
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Deposits</h1>
          <p className="text-muted-foreground mt-1">
            Manage your USDT deposits and track transaction status
          </p>
        </div>
        <button 
          onClick={handleNewDeposit}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Deposit
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-foreground">
            ${stats.totalDeposited.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Deposited</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {stats.confirmedCount}
          </div>
          <div className="text-sm text-muted-foreground">Confirmed</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pendingCount}
          </div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">
            {stats.failedCount}
          </div>
          <div className="text-sm text-muted-foreground">Failed</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
            placeholder="Search by hash, amount, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setStatusFilter(nextFilterStatus())}
          className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <Filter className="w-4 h-4" />
          Status: {statusFilter}
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Deposits Grid */}
      {!isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDeposits.map((deposit) => (
            <DepositRow 
              key={deposit.id} 
              deposit={deposit} 
              onView={handleViewDeposit}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredDeposits.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No deposits found
          </h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your search or filter criteria"
              : "Create your first deposit to get started"
            }
          </p>
        </div>
      )}
    </div>
  );
}
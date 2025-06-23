// components/users/withdrawals/WithdrawalsHistoryComponent.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  History,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  Copy,
  Check,
  RefreshCw,
  Calendar,
  DollarSign,
} from "lucide-react";
import {
  WithdrawalStatus,
  WithdrawalRequest,
} from "@/types/withdrawals/withdrawal.types";
import { useSortedWithdrawals } from "@/app/(user)/[userId]/withdrawals/data_structures/data_structures_hist_withra";
import { formatCurrency, formatDate } from "@/app/(user)/[userId]/withdrawals/utils/shared.utilities";
import { toast } from "sonner";
import { useWithdrawalHistory } from "@/hooks/withrawal/withdrawal.hooks";

interface WithdrawalHistoryProps {
  limit?: number;
  showFilters?: boolean;
  onViewDetails?: (withdrawalId: string) => void;
}

const statusColors: Record<WithdrawalStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const WithdrawalsHistoryComponent = ({
  limit = 100,
  showFilters = true,
  onViewDetails,
}: WithdrawalHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<WithdrawalStatus | "all">(
    "all"
  );
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const {
    data: historyResponse,
    isLoading,
    error,
    refetch,
  } = useWithdrawalHistory({ limit, status: statusFilter });

  const withdrawals: WithdrawalRequest[] = historyResponse?.data || [];
  const sortedWithdrawals = useSortedWithdrawals(withdrawals);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return sortedWithdrawals.filter((w) =>
      term
        ? w.withdrawal_id.toLowerCase().includes(term) ||
        w.receiving_address.toLowerCase().includes(term)
        : true
    );
  }, [searchTerm, sortedWithdrawals]);

  // Copy address helper
  const copyToClipboard = async (address: string) => {
    await navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast.success("Address copied", { duration: 2000 });
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <section className="w-full py-6 px-2 md:px-6 lg:px-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 text-2xl font-semibold text-green-700 dark:text-green-300">
          <History className="h-6 w-6" /> All Withdrawals
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="mb-6 shadow-sm border dark:border-gray-700">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="flex-grow flex items-center bg-gray-50 dark:bg-gray-800 rounded-md px-3">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID or address"
                className="border-0 bg-transparent focus:ring-0 pl-2"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v: WithdrawalStatus | "all") => setStatusFilter(v)}
            >
              <SelectTrigger className="w-full md:w-56">
                <Filter className="h-4 w-4 text-gray-400 mr-1" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Loading / Error */}
      {isLoading && (
        <div className="flex justify-center py-10">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
        </div>
      )}
      {error && (
        <div className="text-center text-red-600 dark:text-red-400 py-6">
          {error.message || "Failed to load history"}
        </div>
      )}

      {/* Withdrawals list */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((w) => (
          <Card
            key={w.withdrawal_id}
            className="hover:shadow-md transition-shadow border dark:border-gray-700"
          >
            <CardHeader className="flex flex-row items-start justify-between p-4 pb-2">
              <div className="flex flex-col">
                <CardTitle className="text-lg font-semibold">
                  {formatCurrency(w.amount)}
                </CardTitle>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(w.requested_at)}
                </span>
              </div>
              <Badge className={statusColors[w.status]}>{w.status}</Badge>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <div className="flex items-center text-sm gap-1 break-all">
                <DollarSign className="h-4 w-4 text-gray-400" />
                {w.wallet_type.toUpperCase()} wallet
              </div>
              <div className="flex items-center text-sm gap-1 break-all">
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
                <span>{w.receiving_address}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(w.receiving_address)}
                >
                  {copiedAddress === w.receiving_address ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails?.(w.withdrawal_id)}
                  className="text-green-600 dark:text-green-400 hover:underline"
                >
                  View Details
                </Button>
                {w.completed_at && (
                  <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3 w-3 mr-1" /> {formatDate(w.completed_at)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && !isLoading && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-10">
          No withdrawals found.
        </div>
      )}
    </section>
  );
};

export default WithdrawalsHistoryComponent;

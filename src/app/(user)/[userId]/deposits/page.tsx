"use client";
import React, { useState, useMemo } from 'react';
import { Search, Plus, Copy, ExternalLink, Filter, ChevronDown, Eye, Calendar, DollarSign, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { mockDeposits, mockStats, StatsCard } from '@/types/users/deposit.mock.types';
import { StatusBadge } from '@/components/users/deposits/StatusBadge';


const DepositRow = ({ deposit, onViewDetails }: { deposit: typeof mockDeposits[0], onViewDetails: (id: string) => void }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',  
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              ${deposit.amount.toFixed(2)} USDT
            </span>
            <StatusBadge status={deposit.status} />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            {formatDate(deposit.createdAt)}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {truncateHash(deposit.transactionHash)}
            </span>
            <button
              onClick={() => copyToClipboard(deposit.transactionHash)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Copy transaction hash"
            >
              <Copy className="w-3 h-3 text-gray-400" />
            </button>
            <button
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="View on blockchain explorer"
            >
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(deposit.id)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
        </div>
      </div>

      {copied && (
        <div className="mt-2 text-xs text-green-600 dark:text-green-400">
          Transaction hash copied!
        </div>
      )}
    </div>
  );
};

const DepositsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredDeposits = useMemo(() => {
    return mockDeposits.filter(deposit => {
      const matchesSearch = deposit.transactionHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.amount.toString().includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || deposit.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const handleViewDetails = (depositId: string) => {
    // Navigate to deposit details page
    console.log('Navigate to deposit:', depositId);
  };

  const handleNewDeposit = () => {
    // Navigate to new deposit page
    console.log('Navigate to new deposit');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Deposits</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Manage your USDT deposits and track transaction status
            </p>
          </div>
          <button
            onClick={handleNewDeposit}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            <Plus className="w-5 h-5" />
            New Deposit
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Deposited"
            value={`$${mockStats.totalDeposited.toFixed(2)}`}
            subtitle="USDT"
            icon={DollarSign}
            variant="primary"
          />
          <StatsCard
            title="Successful Deposits"
            value={mockStats.successfulDeposits}
            subtitle="Confirmed transactions"
            icon={CheckCircle}
            variant="success"
          />
          <StatsCard
            title="Pending Deposits"
            value={mockStats.pendingDeposits}
            subtitle="Awaiting confirmation"
            icon={Clock}
            variant="warning"
          />
          <StatsCard
            title="Average Amount"
            value={`$${mockStats.averageAmount.toFixed(2)}`}
            subtitle="Per deposit"
            icon={DollarSign}
          />
            <StatsCard
            title="Average Amount"
            value={`$${mockStats.averageAmount.toFixed(2)}`}
            subtitle="Per deposit"
            icon={DollarSign}
          />
               <StatsCard
            title="Successful Deposits"
            value={mockStats.successfulDeposits}
            subtitle="Confirmed transactions"
            icon={CheckCircle}
            variant="success"
          />
           <StatsCard
            title="Pending Deposits"
            value={mockStats.pendingDeposits}
            subtitle="Awaiting confirmation"
            icon={Clock}
            variant="warning"
          />

        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by transaction hash or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Status: {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              <ChevronDown className="w-4 h-4" />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {['all', 'confirmed', 'pending', 'failed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setIsFilterOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Deposits List */}
        <div className="space-y-4">
          {filteredDeposits.length > 0 ? (
            filteredDeposits.map((deposit) => (
              <DepositRow
                key={deposit.id}
                deposit={deposit}
                onViewDetails={handleViewDetails}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No deposits found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start by making your first deposit to begin investing.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button
                  onClick={handleNewDeposit}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Make First Deposit
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Info */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Important Information
              </p>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Minimum deposit amount: $10 USDT</li>
                <li>• Only TRC20 network is supported</li>
                <li>• Deposits are usually confirmed within 10-30 minutes</li>
                <li>• Always double-check the deposit address before sending</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositsPage;
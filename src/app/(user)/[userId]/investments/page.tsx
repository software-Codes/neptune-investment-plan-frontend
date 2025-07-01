"use client"
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Plus,
    DollarSign,
    TrendingUp,
    Wallet,
    ArrowRight,
    Calendar,
    ArrowUpRight,
    AlertCircle,
    CheckCircle,
    Target,
    Banknote,
    RefreshCw
} from 'lucide-react';
import { Investment } from '@/types/investments/investments.types';
import  {mockBalances, mockInvestments} from "@/mocks/investments.mock";

// Enhanced Status Badge Component
const StatusBadge = ({ status }: { status: 'active' | 'closed' | 'cancelled' }) => {
    const variants = {
        active: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: TrendingUp },
        closed: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', icon: CheckCircle },
        cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: AlertCircle }
    };

    const { color, icon: Icon } = variants[status] || variants.active;

    return (
        <Badge className={`${color} border-0 font-medium`}>
            <Icon className="w-3 h-3 mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
};

// Enhanced Investment Card Component
const InvestmentCard = ({ investment, onClick }: { investment: Investment; onClick: () => void }) => {
    const startDate = new Date(investment.startDate);
    const releaseDate = new Date(investment.releaseDate);
    const daysActive = Math.floor((Date.now() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const daysUntilRelease = Math.max(0, Math.floor((releaseDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
    const progressPercentage = Math.min(100, (daysActive / 30) * 100);

    return (
        <Card
            onClick={onClick}
            className="cursor-pointer p-6 hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/80 hover:scale-[1.02] group"
        >
            <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                            ${investment.principal.toLocaleString()}
                        </h3>
                        <p className="text-sm text-muted-foreground">Principal Investment</p>
                    </div>
                    <StatusBadge status={investment.status} />
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                        <div className="flex items-center justify-center mb-1">
                            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                            ${investment.earningsToDate.toFixed(2)}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-500">Earnings</p>
                    </div>

                    <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                        <div className="flex items-center justify-center mb-1">
                            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                            {daysUntilRelease}d
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-500">Until Release</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                        Started {startDate.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
                    </p>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
            </div>
        </Card>
    );
};

// Wallet Transfer Component
const WalletTransfer = () => {
    const [fromWallet, setFromWallet] = useState('');
    const [toWallet, setToWallet] = useState('');
    const [amount, setAmount] = useState('');
    const [isTransferring, setIsTransferring] = useState(false);

    const walletOptions = [
        { value: 'account', label: 'Account Wallet', balance: mockBalances.accountWallet, icon: Wallet },
        { value: 'trading', label: 'Trading Wallet', balance: mockBalances.tradingWallet, icon: TrendingUp },
        { value: 'referral', label: 'Referral Wallet', balance: mockBalances.referralWallet, icon: Target }
    ];

    const selectedFromWallet = walletOptions.find(w => w.value === fromWallet);
    const maxAmount = selectedFromWallet?.balance || 0;
    const isValidTransfer = fromWallet && toWallet && fromWallet !== toWallet && parseFloat(amount) > 0 && parseFloat(amount) <= maxAmount;

    const handleTransfer = async () => {
        if (!isValidTransfer) return;

        setIsTransferring(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsTransferring(false);

        // Reset form
        setFromWallet('');
        setToWallet('');
        setAmount('');
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* From Wallet */}
                <div className="space-y-2">
                    <Label htmlFor="from-wallet">From Wallet</Label>
                    <Select value={fromWallet} onValueChange={setFromWallet}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select source wallet" />
                        </SelectTrigger>
                        <SelectContent>
                            {walletOptions.map((wallet) => (
                                <SelectItem key={wallet.value} value={wallet.value}>
                                    <div className="flex items-center gap-2">
                                        <wallet.icon className="w-4 h-4" />
                                        <span>{wallet.label}</span>
                                        <span className="text-muted-foreground">
                      (${wallet.balance.toFixed(2)})
                    </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* To Wallet */}
                <div className="space-y-2">
                    <Label htmlFor="to-wallet">To Wallet</Label>
                    <Select value={toWallet} onValueChange={setToWallet}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select destination wallet" />
                        </SelectTrigger>
                        <SelectContent>
                            {walletOptions
                                .filter(w => w.value !== fromWallet)
                                .map((wallet) => (
                                    <SelectItem key={wallet.value} value={wallet.value}>
                                        <div className="flex items-center gap-2">
                                            <wallet.icon className="w-4 h-4" />
                                            <span>{wallet.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
                <Label htmlFor="amount">Amount (USDT)</Label>
                <div className="relative">
                    <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pr-20"
                    />
                    {selectedFromWallet && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-8 px-2 text-xs"
                            onClick={() => setAmount(maxAmount.toString())}
                        >
                            Max
                        </Button>
                    )}
                </div>
                {selectedFromWallet && (
                    <p className="text-xs text-muted-foreground">
                        Available: ${maxAmount.toFixed(2)}
                    </p>
                )}
            </div>

            {/* Transfer Visualization */}
            {fromWallet && toWallet && (
                <div className="p-4 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {(() => {
                                const from = walletOptions.find(w => w.value === fromWallet);
                                if (!from) return null;
                                return (
                                    <>
                                        <from.icon className="w-5 h-5 text-primary" />
                                        <span className="font-medium">{from.label}</span>
                                    </>
                                );
                            })()}
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        <div className="flex items-center gap-2">
                            {(() => {
                                const to = walletOptions.find(w => w.value === toWallet);
                                if (!to) return null;
                                return (
                                    <>
                                        <to.icon className="w-5 h-5 text-primary" />
                                        <span className="font-medium">{to.label}</span>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                    {amount && (
                        <div className="mt-2 text-center">
                            <span className="text-2xl font-bold text-primary">${parseFloat(amount || '0').toFixed(2)}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Transfer Button */}
            <Button
                onClick={handleTransfer}
                disabled={!isValidTransfer || isTransferring}
                className="w-full"
                size="lg"
            >
                {isTransferring ? (
                    <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Transferring...
                    </>
                ) : (
                    <>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Transfer Funds
                    </>
                )}
            </Button>
        </div>
    );
};

// New Investment Form Component
const NewInvestmentForm = () => {
    const [amount, setAmount] = useState('10');
    const [isCreating, setIsCreating] = useState(false);

    const tradingBalance = mockBalances.tradingWallet;
    const investmentAmount = parseFloat(amount || '0');
    const needsTransfer = tradingBalance < investmentAmount;
    const transferAmount = Math.max(0, investmentAmount - tradingBalance);

    const handleCreateInvestment = async () => {
        setIsCreating(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsCreating(false);
    };

    return (
        <div className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
                <Label htmlFor="investment-amount">Investment Amount (USDT)</Label>
                <Input
                    id="investment-amount"
                    type="number"
                    min="10"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg"
                />
                <p className="text-xs text-muted-foreground">Minimum investment: $10</p>
            </div>

            {/* Investment Preview */}
            <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 border-0">
                <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        Investment Preview
                    </h3>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Principal</p>
                            <p className="font-semibold">${investmentAmount.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Daily Interest</p>
                            <p className="font-semibold text-green-600">0.25%</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Expected 30-day return</p>
                            <p className="font-semibold text-green-600">
                                ${(investmentAmount * 0.25 * 30).toFixed()}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Release date</p>
                            <p className="font-semibold">
                                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Balance Check */}
            {needsTransfer && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        You have ${tradingBalance.toFixed(2)} in your trading wallet.
                        You&apos;ll need to transfer ${transferAmount.toFixed(2)} from your account wallet to complete this investment.
                    </AlertDescription>
                </Alert>
            )}

            {/* Create Investment Button */}
            <Button
                onClick={handleCreateInvestment}
                disabled={investmentAmount < 10 || isCreating}
                className="w-full"
                size="lg"
            >
                {isCreating ? (
                    <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Creating Investment...
                    </>
                ) : (
                    <>
                        <Plus className="w-4 h-4 mr-2" />
                        Start Investment
                    </>
                )}
            </Button>
        </div>
    );
};

// Main Investment Dashboard Component
export default function InvestmentDashboard() {
    const [selectedTab, setSelectedTab] = useState('overview');

    const totalPrincipal = mockInvestments.reduce((sum, i) => sum + i.principal, 0);
    const totalEarnings = mockInvestments.reduce((sum, i) => sum + i.earningsToDate, 0);
    const activeInvestments = mockInvestments.filter(i => i.status === 'active');

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Investment Portfolio
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Earn 0.25% compound interest daily • Minimum $10 investment
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/20">
                            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                                ${totalPrincipal.toLocaleString()}
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-500">Total Principal</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                ${totalEarnings.toFixed(2)}
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-500">Total Earnings</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-500/20">
                            <Target className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                                {activeInvestments.length}
                            </p>
                            <p className="text-sm text-yellow-600 dark:text-yellow-500">Active Investments</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                            <Banknote className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                                ${(mockBalances.accountWallet + mockBalances.tradingWallet + mockBalances.referralWallet).toFixed(2)}
                            </p>
                            <p className="text-sm text-purple-600 dark:text-purple-500">Total Balance</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
                    <TabsTrigger value="new-investment">New Investment</TabsTrigger>
                    <TabsTrigger value="wallet-transfer">Wallet Transfer</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {mockInvestments.map((investment) => (
                            <InvestmentCard
                                key={investment.id}
                                investment={investment}
                                onClick={() => console.log('Navigate to investment detail', investment.id)}
                            />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="new-investment">
                    <div className="max-w-2xl mx-auto">
                        <Card className="p-8">
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold">Start New Investment</h2>
                                    <p className="text-muted-foreground">Begin earning 0.25% daily compound interest</p>
                                </div>
                                <NewInvestmentForm />
                            </div>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="wallet-transfer">
                    <div className="max-w-2xl mx-auto">
                        <Card className="p-8">
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold">Transfer Between Wallets</h2>
                                    <p className="text-muted-foreground">Move funds between your account, trading, and referral wallets</p>
                                </div>

                                {/* Wallet Balances Preview */}
                                <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/20">
                                    <div className="text-center">
                                        <Wallet className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                                        <p className="text-xs text-muted-foreground">Account</p>
                                        <p className="font-semibold">${mockBalances.accountWallet.toFixed(2)}</p>
                                    </div>
                                    <div className="text-center">
                                        <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-500" />
                                        <p className="text-xs text-muted-foreground">Trading</p>
                                        <p className="font-semibold">${mockBalances.tradingWallet.toFixed(2)}</p>
                                    </div>
                                    <div className="text-center">
                                        <Target className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                                        <p className="text-xs text-muted-foreground">Referral</p>
                                        <p className="font-semibold">${mockBalances.referralWallet.toFixed(2)}</p>
                                    </div>
                                </div>

                                <WalletTransfer />
                            </div>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
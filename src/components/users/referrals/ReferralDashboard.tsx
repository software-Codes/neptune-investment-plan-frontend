import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Copy, 
  Share2, 
  Send, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Wallet,
  ExternalLink,
  MessageCircle,
  Mail,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Award,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";

// Mock hooks (replace with your actual hooks)
const useReferralCode = () => ({
  data: { 
    code: "INVEST2025", 
    created_at: new Date("2025-01-01"),
    is_active: true,
    usage_count: 12,
    max_usage: undefined
  },
  isLoading: false,
  error: null
});

const useReferralStats = () => ({
  data: { 
    totalReferred: 12,
    totalEarned: "485.50",
    activeReferees: 8,
    availableBalance: "285.50",
    totalWithdrawn: "200.00",
    totalReinvested: "0.00",
    conversionRate: 66.7
  },
  isLoading: false,
  error: null
});

const useReferralEarnings = () => ({
  data: {
    pages: [{
      items: Array.from({ length: 10 }).map((_, i) => ({
        id: `earn_${i + 1}`,
        referee_id: `user_${i + 1}`,
        referee_name: `User ${i + 1}`,
        amount: (Math.random() * 50 + 10).toFixed(2),
        date: new Date(Date.now() - i * 86400000 * (Math.random() * 5 + 1)),
        status: Math.random() > 0.8 ? "pending" : "paid" as "pending" | "paid" | "completed" | "cancelled" | "failed",
        deposit_amount: (Math.random() * 500 + 100).toFixed(2),
        bonus_percentage: 10
      }))
    }]
  },
  isLoading: false,
  error: null,
  fetchNextPage: () => {},
  hasNextPage: false,
  isFetchingNextPage: false
});

const useReferralActivities = () => ({
  data: {
    pages: [{
      items: Array.from({ length: 8 }).map((_, i) => ({
        id: `activity_${i + 1}`,
        type: (["referral_joined", "bonus_earned", "withdrawal", "reinvestment"] as const)[Math.floor(Math.random() * 4)],
        description: [
          "New user joined with your code",
          "Bonus earned from referral",
          "Withdrawal processed",
          "Amount reinvested"
        ][Math.floor(Math.random() * 4)],
        amount: Math.random() > 0.5 ? (Math.random() * 50 + 5).toFixed(2) : undefined,
        date: new Date(Date.now() - i * 86400000 * Math.random() * 10),
        status: Math.random() > 0.9 ? "pending" : "completed" as "pending" | "paid" | "completed" | "cancelled" | "failed"
      }))
    }]
  },
  isLoading: false,
  error: null,
  fetchNextPage: () => {},
  hasNextPage: false,
  isFetchingNextPage: false
});

const useReferralActions = () => ({
  withdraw: {
    mutateAsync: async (data: { amount: string; payment_method: string }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Withdraw:", data);
    },
    isPending: false
  },
  reinvest: {
    mutateAsync: async (data: { amount: string }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Reinvest:", data);
    },
    isPending: false
  },
  applyInviteCode: {
    mutateAsync: async (code: string) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Apply code:", code);
    },
    isPending: false
  },
  validateCode: {
    mutateAsync: async (code: string) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { valid: code.length >= 3 };
    }
  }
});

const useReferralSharing = () => ({
  shareCode: async (method: "copy" | "whatsapp" | "telegram" | "email") => {
    console.log("Share via:", method);
  },
  copyCode: async () => {
    console.log("Code copied");
    toast.success("Referral code copied to clipboard!");
  },
  referralCode: "INVEST2025"
});

const ReferralDashboard = () => {
  const { data: codeData, isLoading: codeLoading, error: codeError } = useReferralCode();
  const { data: statsData, isLoading: statsLoading, error: statsError } = useReferralStats();
  const earningsQuery = useReferralEarnings();
  const activitiesQuery = useReferralActivities();
  const { withdraw, reinvest, applyInviteCode, validateCode } = useReferralActions();
  const { shareCode, copyCode } = useReferralSharing();
  
  const [inviteInput, setInviteInput] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [reinvestAmount, setReinvestAmount] = useState("");
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  // Validate invite code as user types
  const handleInviteInputChange = async (value: string) => {
    setInviteInput(value);
    if (value.length >= 3) {
      setIsValidatingCode(true);
      try {
        await validateCode.mutateAsync(value);
      } catch (error) {
        console.error("Validation error:", error);
      } finally {
        setIsValidatingCode(false);
      }
    }
  };

  const handleApplyCode = async () => {
    if (!inviteInput.trim()) return;
    
    try {
      await applyInviteCode.mutateAsync(inviteInput.trim());
      setInviteInput("");
    } catch (error) {
      console.error("Apply code error:", error);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    
    if (amount > parseFloat(statsData?.availableBalance || "0")) {
      alert("Insufficient balance");
      return;
    }

    try {
      await withdraw.mutateAsync({
        amount: withdrawAmount,
        payment_method: "binance"
      });
      setWithdrawAmount("");
    } catch (error) {
      console.error("Withdraw error:", error);
    }
  };

  const handleReinvest = async () => {
    const amount = parseFloat(reinvestAmount);
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    
    if (amount > parseFloat(statsData?.availableBalance || "0")) {
      alert("Insufficient balance");
      return;
    }

    try {
      await reinvest.mutateAsync({
        amount: reinvestAmount
      });
      setReinvestAmount("");
    } catch (error) {
      console.error("Reinvest error:", error);
    }
  };

  const getActivityIcon = (type: "referral_joined" | "bonus_earned" | "withdrawal" | "reinvestment") => {
    switch (type) {
      case "referral_joined": return <Users className="h-4 w-4 text-blue-500" />;
      case "bonus_earned": return <Award className="h-4 w-4 text-green-500" />;
      case "withdrawal": return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "reinvestment": return <ArrowDownRight className="h-4 w-4 text-purple-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: 'pending' | 'paid' | 'completed' | 'cancelled' | 'failed') => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      paid: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      failed: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    };
    
    return (
      <Badge className={`${variants[status] || variants.pending} border-0`}>
        {status}
      </Badge>
    );
  };

  // Loading state
  if (codeLoading || statsLoading) {
    return (
      <div className="space-y-6 pb-16 px-4 max-w-7xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Error state
  if (codeError || statsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 px-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Unable to load referral data</h3>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 px-4 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Referral Dashboard
        </h1>
        <p className="text-muted-foreground">
          Earn 10% commission on every successful referral
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Referred */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Referred</p>
                <p className="text-3xl font-bold text-primary">{statsData?.totalReferred || 0}</p>
              </div>
              <Users className="h-8 w-8 text-primary/60" />
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3" />
              {statsData?.conversionRate?.toFixed(1) || 0}% conversion rate
            </div>
          </CardContent>
        </Card>

        {/* Total Earned */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-secondary">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                <p className="text-3xl font-bold text-secondary">${statsData?.totalEarned || "0.00"}</p>
              </div>
              <Award className="h-8 w-8 text-secondary/60" />
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <DollarSign className="mr-1 h-3 w-3" />
              All time earnings
            </div>
          </CardContent>
        </Card>

        {/* Available Balance */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-green-600">
                    {showBalance ? `$${statsData?.availableBalance || "0.00"}` : "••••••"}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="h-6 w-6 p-0"
                  >
                    {showBalance ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <Wallet className="h-8 w-8 text-green-500/60" />
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <CheckCircle className="mr-1 h-3 w-3" />
              Ready to withdraw
            </div>
          </CardContent>
        </Card>

        {/* Active Referees */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Referees</p>
                <p className="text-3xl font-bold text-blue-600">{statsData?.activeReferees || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500/60" />
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <Users className="mr-1 h-3 w-3" />
              Currently investing
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg border-2 border-dashed border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Referral Code</p>
                <p className="text-2xl font-mono font-bold text-primary">{codeData?.code}</p>
              </div>
              <Button
                onClick={copyCode}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Used {codeData?.usage_count || 0} times
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              onClick={() => shareCode("copy")}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>
            <Button
              onClick={() => shareCode("whatsapp")}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
            <Button
              onClick={() => shareCode("telegram")}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Telegram
            </Button>
            <Button
              onClick={() => shareCode("email")}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Withdraw Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5" />
              Withdraw Earnings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (USD)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="1"
                max={statsData?.availableBalance}
              />
              <p className="text-xs text-muted-foreground">
                Available: ${statsData?.availableBalance || "0.00"}
              </p>
            </div>
            <Button
              onClick={handleWithdraw}
              disabled={withdraw.isPending || !withdrawAmount}
              className="w-full gap-2"
            >
              {withdraw.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUpRight className="h-4 w-4" />
              )}
              {withdraw.isPending ? "Processing..." : "Withdraw"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Withdrawals are processed within 20 minutes
            </p>
          </CardContent>
        </Card>

        {/* Reinvest Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownRight className="h-5 w-5" />
              Reinvest Earnings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (USD)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={reinvestAmount}
                onChange={(e) => setReinvestAmount(e.target.value)}
                min="10"
                max={statsData?.availableBalance}
              />
              <p className="text-xs text-muted-foreground">
                Minimum: $10.00 • Available: ${statsData?.availableBalance || "0.00"}
              </p>
            </div>
            <Button
              onClick={handleReinvest}
              disabled={reinvest.isPending || !reinvestAmount}
              className="w-full gap-2"
              variant="secondary"
            >
              {reinvest.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {reinvest.isPending ? "Processing..." : "Reinvest"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Reinvest to compound your returns at 0.25% daily
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Apply Invite Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Apply Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter referral code"
                value={inviteInput}
                onChange={(e) => handleInviteInputChange(e.target.value)}
                disabled={applyInviteCode.isPending}
              />
            </div>
            <Button
              onClick={handleApplyCode}
              disabled={applyInviteCode.isPending || !inviteInput.trim() || isValidatingCode}
              className="gap-2"
            >
              {applyInviteCode.isPending || isValidatingCode ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Apply
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Apply a referral code to get started with bonus benefits
          </p>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="earnings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="earnings">Earnings History</TabsTrigger>
          <TabsTrigger value="activities">Recent Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Earnings History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {earningsQuery.data?.pages[0]?.items?.map((earning) => (
                  <div
                    key={earning.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{earning.referee_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {earning.date.toLocaleDateString()} • {earning.bonus_percentage}% bonus
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+${earning.amount}</p>
                      {getStatusBadge(earning.status)}
                    </div>
                  </div>
                ))}
                {earningsQuery.data?.pages[0]?.items?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No earnings yet</p>
                    <p className="text-sm">Start referring users to see your earnings here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activitiesQuery.data?.pages[0]?.items?.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.date.toLocaleDateString()} at {activity.date.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {activity.amount && (
                        <p className="font-bold text-sm">
                          {activity.type === "withdrawal" ? "-" : "+"}${activity.amount}
                        </p>
                      )}
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>
                ))}
                {activitiesQuery.data?.pages[0]?.items?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No activities yet</p>
                    <p className="text-sm">Your referral activities will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">${statsData?.totalWithdrawn || "0.00"}</p>
          <p className="text-xs text-muted-foreground">Total Withdrawn</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">${statsData?.totalReinvested || "0.00"}</p>
          <p className="text-xs text-muted-foreground">Total Reinvested</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">{statsData?.conversionRate?.toFixed(1) || 0}%</p>
          <p className="text-xs text-muted-foreground">Conversion Rate</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold text-orange-600">10%</p>
          <p className="text-xs text-muted-foreground">Commission Rate</p>
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboard;
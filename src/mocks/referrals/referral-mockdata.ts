export // Enhanced mock data with more realistic scenarios
const enhancedMockData = {
  code: { 
    code: "INVEST2025", 
    created_at: new Date("2025-01-01"),
    is_active: true,
    usage_count: 12,
    max_usage: undefined
  },
  stats: { 
    totalReferred: 12,
    totalEarned: "485.50",
    activeReferees: 8,
    availableBalance: "285.50",
    totalWithdrawn: "500.00",
    totalReinvested: "0.00",
    conversionRate: 66.7
  },
  earnings: Array.from({ length: 20 }).map((_, i) => ({
    id: `earn_${i + 1}`,
    referee_id: `user_${i + 1}`,
    referee_name: `User ${i + 1}`,
    amount: (Math.random() * 50 + 10).toFixed(2),
    date: new Date(Date.now() - i * 86400000 * (Math.random() * 5 + 1)),
    status: Math.random() > 0.8 ? "pending" : "paid" as "pending" | "paid" | "cancelled",
    deposit_amount: (Math.random() * 500 + 100).toFixed(2),
    bonus_percentage: 10
  })),
  activities: Array.from({ length: 15 }).map((_, i) => ({
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
    status: Math.random() > 0.9 ? "pending" : "completed" as const
  })),
  balance: 285.50,
  analytics: {
    monthly_earnings: [
      { month: "Jan 2025", earnings: "125.50", referrals: 3 },
      { month: "Dec 2024", earnings: "200.00", referrals: 5 },
      { month: "Nov 2024", earnings: "160.00", referrals: 4 }
    ],
    top_referees: [
      { id: "user_1", name: "John D.", total_deposits: "1250.00", bonus_earned: "125.00" },
      { id: "user_2", name: "Sarah M.", total_deposits: "850.00", bonus_earned: "85.00" }
    ],
    performance_metrics: {
      click_through_rate: 15.5,
      conversion_rate: 66.7,
      average_deposit: "425.50",
      retention_rate: 78.3
    }
  }
};
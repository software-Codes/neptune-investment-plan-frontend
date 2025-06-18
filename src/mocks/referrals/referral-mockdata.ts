export const mockData = {
  code: { code: "ABC123", created_at: new Date("2025-01-01") },
  stats: { totalReferred: 4, totalEarned: "25.00", activeReferees: 3 },
  earnings: Array.from({ length: 12 }).map((_, i) => ({
    id: `earn_${i}`,
    referee_id: `user_${i}`,
    amount: (2 + i * 0.5).toFixed(2),
    date: new Date(Date.now() - i * 86400000),
    status: "paid" as const,
  })),
  balance: 25.0,
};
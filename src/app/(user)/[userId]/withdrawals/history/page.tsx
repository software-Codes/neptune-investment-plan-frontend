// app/(user)/[userId]/withdrawals/history/page.tsx
import WithdrawalsHistoryComponent from '@/components/users/withdrawals/WithdrawalsHistoryComponent';

export default function WithdrawalsHistory() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
            <WithdrawalsHistoryComponent />
        </main>
    );
}

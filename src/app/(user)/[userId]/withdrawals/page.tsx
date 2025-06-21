import React from "react";
import { WithdrawalForm } from "@/components/users/withdrawals/WithdrawalForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WithdrawalsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center py-8 px-2">
      <section className="w-full max-w-3xl mx-auto">
        <Card className="mb-8 shadow-none border-0 bg-transparent">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-3xl md:text-4xl font-bold text-green-700 dark:text-green-300 text-center">
              Withdraw Your Funds Securely
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 text-center max-w-2xl mx-auto">
              Easily transfer your available balance to your Binance wallet. Our withdrawal process is designed for your security and peace of mind. Please ensure your receiving address is correct to avoid any delays or loss of funds.
            </p>
          </CardContent>
        </Card>
        <div className="w-full">
          <WithdrawalForm />
        </div>
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          <p>
            <strong>Need help?</strong> If you have questions about withdrawals or encounter any issues, please visit our <a href="/support" className="text-green-700 dark:text-green-300 underline hover:text-green-900 dark:hover:text-green-100">Support Center</a> for assistance.
          </p>
          <p className="mt-2">
            <span className="font-medium text-gray-700 dark:text-gray-200">Security Tip:</span> Never share your wallet credentials with anyone. Withdrawals are processed manually to ensure your funds are safe.
          </p>
        </div>
      </section>
    </main>
  );
}
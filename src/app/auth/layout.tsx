//auth/layout.tsx
"use client"

import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/ModeToggle"
import { DollarSign, Activity, Gift, Lock } from "lucide-react"

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname()
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  const isAuthCodeRoute = pathname?.includes('/auth-code')

  useEffect(() => {
    if (isAuthCodeRoute) return;

    const container = document.querySelector('.tradingview-widget-container__widget');
    if (!container) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;

    const widgetConfig = {
      symbol: "BINANCE:SOLUSDT",
      width: "100%",
      height: "400",
      locale: "en",
      dateRange: "1D",
      colorTheme: "light",
      trendLineColor: "rgba(152, 0, 255, 1)",
      underLineColor: "rgba(152, 0, 255, 1)",
      underLineBottomColor: "rgba(0, 255, 255, 0)",
      isTransparent: true,
      autosize: true,
      largeChartUrl: "",
      chartOnly: false,
      noTimeScale: false
    };

    script.innerHTML = JSON.stringify(widgetConfig);
    container.appendChild(script);
    scriptRef.current = script;

    // Cleanup function
    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
    };
  }, [isAuthCodeRoute]);

  // For auth-code routes, just render children without wrapper
  if (isAuthCodeRoute) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Investment Description */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <div className="space-y-8">
            <div>
              {/* Mode Toggle */}
              <div className="mt-8 text-black flex justify-center">
                <ModeToggle />
              </div>
              <h2 className="text-4xl font-bold leading-tight mb-4">
                Invest Smart with Neptune
              </h2>
              <p className="text-xl text-emerald-100 leading-relaxed">
                A secure investment platform with automated compounding and instant referrals.
              </p>
            </div>

            {/* TradingView Widget */}
            <div className="tradingview-widget-container rounded-lg overflow-hidden bg-black/20 backdrop-blur-sm p-4">
              <div className="tradingview-widget-container__widget" />
            </div>

            {/* Key Features */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Compound Interest</h3>
                  <p className="text-emerald-100">0.25% daily returns with automatic compounding.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Daily Compounding</h3>
                  <p className="text-emerald-100">Earn daily returns with our automated investment system.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Secure Withdrawals</h3>
                  <p className="text-emerald-100">Admin-approved withdrawals for maximum security.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Referral Program</h3>
                  <p className="text-emerald-100">Earn 10% bonus on your referrals&apos; first deposits.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-slate-900 bg-gradient-to-b to-gray-100 dark:to-slate-800">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
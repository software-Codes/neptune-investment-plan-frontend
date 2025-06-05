"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RegisterForm } from "@/components/auth/register-form"
import { ArrowLeft, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/auth/login')}
          className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Button>
      </div>

      {/* Welcome Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Create Your Account
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Start your investment journey today
        </p>
      </div>

      {/* Registration Card */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white text-center">
            Join Neptune Investment
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 text-center">
            Complete the form below to get started
          </CardDescription>
        </CardHeader>

        <CardContent>
          <RegisterForm />

          {/* Login Link */}
          <div className="mt-8 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-slate-800 px-4 text-slate-500 dark:text-slate-400">
                  Already have an account?
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push('/auth/login')}
              className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
            >
              Sign in to your account
            </Button>
          </div>

          {/* Terms and Privacy */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
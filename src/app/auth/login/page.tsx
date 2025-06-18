/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Shield,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import { NeptuneLogo } from "@/assets/images/Images"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, user, checkVerificationStatus } = useAuth()
  const [redirecting, setRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showWelcomeBack, setShowWelcomeBack] = useState(false)
  const redirectAttempted = useRef(false)

  // preserve redirectTo & show toast on verification success/failure
  useEffect(() => {
    const to = searchParams.get("redirectTo")
    if (to) sessionStorage.setItem("redirectTo", to)

    const status = searchParams.get("status")
    const msg = searchParams.get("message")
    if (status === "verified") {
      setShowWelcomeBack(true)
      toast.success(msg || "Account Verified!", {
        description: "You can now sign in.",
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
      })
      clearParams()
    }
    if (status === "verification-failed") {
      toast.error(msg || "Verification Failed", {
        description: "Please try again.",
        icon: <XCircle className="h-4 w-4 text-red-500" />
      })
      clearParams()
    }
  }, [searchParams])

  // If already authenticated and verified, redirect
  useEffect(() => {
    if (user && !redirectAttempted.current) {
      redirectAttempted.current = true
      setRedirecting(true)
      checkVerificationStatus()
        .then((status) => {
          if (!status.required) {
            const dest = sessionStorage.getItem("redirectTo") || `/${user.user_id}/dashboard`
            sessionStorage.removeItem("redirectTo")
            router.push(dest)
          } else {
            setRedirecting(false)
            redirectAttempted.current = false
          }
        })
        .catch(() => {
          setRedirecting(false)
          redirectAttempted.current = false
        })
    }
  }, [user, checkVerificationStatus, router])

  const clearParams = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete("status")
    url.searchParams.delete("message")
    window.history.replaceState({}, "", url.toString())
  }

  const handleLogin = async (data: { email: string; password: string }) => {
    setError(null)
    setRedirecting(true)

    try {
      // Delegates actual login & verification errors to the form
      await login(data.email, data.password)
      // successful login → your useEffect redirect runs
    } catch (err: any) {
      setRedirecting(false)

      if (err.requiresVerification) {
        // rethrow so LoginForm.handleSubmit will catch it
        throw err
      }

      // handle all other errors here
      const msg = err.message || "Please try again."
      setError(msg)
      toast.error("Login Failed", {
        description: msg,
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      })
    }
  }

  // Show loading state while redirecting
  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Loader2 className="animate-spin h-16 w-16 text-emerald-600" />
        <p className="ml-4 text-emerald-700 dark:text-emerald-400">Signing you in…</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/auth/register')}
          className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Register
        </Button>
      </div>

      {/* Welcome Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 mb-4 overflow-hidden">
          <Image src={NeptuneLogo} alt="Neptune logo" className="w-8 h-8 rounded-full" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome Back
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Sign in to continue to your dashboard
        </p>
      </div>

      {/* Success message for verified accounts */}
      {showWelcomeBack && (
        <div className="mb-6">
          <Alert className="bg-green-50 border-green-200 shadow-sm dark:bg-green-950/20 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-300">
              <span className="font-semibold">Account verified successfully!</span> You can now sign in.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* General Error Alert */}
      {error && (
        <div className="mb-6">
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              <span className="font-semibold">Sign in failed:</span> {error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Login Card */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white text-center">
            Sign in to Neptune Investment
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Login Form */}
          <LoginForm
            onSubmit={handleLogin}
            onVerificationRequired={() => {
              // when the user clicks "Verify Account Now" inside the form,
              // the form will call this, so you can navigate to OTP:
              router.push("/auth/auth-code/otp-verify")
            }}
          />

          {/* Register Link */}
          <div className="mt-8 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-slate-800 px-4 text-slate-500 dark:text-slate-400">
                  Don&apos;t have an account?
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push('/auth/register')}
              className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
            >
              Create a new account
            </Button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" />
              Your data is protected with enterprise-grade security
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
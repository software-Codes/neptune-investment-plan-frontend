/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  AlertCircle, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Shield,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, user, checkVerificationStatus } = useAuth()
  const [redirecting, setRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showWelcomeBack, setShowWelcomeBack] = useState(false)

  // Capture redirectTo & handle verify status
  useEffect(() => {
    const to = searchParams.get("redirectTo")
    if (to) sessionStorage.setItem("redirectTo", to)

    const status = searchParams.get("status")
    const msg = searchParams.get("message")
    
    if (status === "verified") {
      setShowWelcomeBack(true)
      toast.success(msg || "Account Verified Successfully!", { 
        description: "You can now sign in to your account.",
        duration: 6000,
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
      })
      clearParams()
    }
    
    if (status === "verification-failed") {
      toast.error(msg || "Verification Failed", {
        description: "Please try again or request a new verification code.",
        duration: 5000,
        icon: <XCircle className="h-4 w-4 text-red-500" />
      })
      clearParams()
    }
  }, [searchParams])

  // If already authenticated and verified, redirect
  useEffect(() => {
    if (user) {
      setRedirecting(true)
      checkVerificationStatus().then((st) => {
        if (!st.required) {
          const to = sessionStorage.getItem("redirectTo") || `/(user)/${user.user_id}/dashboard`
          sessionStorage.removeItem("redirectTo")
          router.push(to)
        } else {
          setRedirecting(false)
        }
      }).catch(() => {
        setRedirecting(false)
      })
    }
  }, [user, checkVerificationStatus, router])

  const clearParams = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete("status")
    url.searchParams.delete("message")
    window.history.replaceState({}, "", url.toString())
  }

  const handleLogin = async (email: string, password: string) => {
    setError(null)
    setRedirecting(true)
    
    try {
      await login(email, password)
      // On success, the user effect will handle redirection
    } catch (err: any) {
      setRedirecting(false)
      
      if (err.requiresVerification) {
        // Store verification data for the OTP page
        sessionStorage.setItem("verificationUserId", err.userId)
        sessionStorage.setItem("verificationEmail", err.email || email)
        sessionStorage.setItem("returnUrl", sessionStorage.getItem("redirectTo") || `/(user)/${err.userId}/dashboard`)
        
        // Navigate to OTP verification page
        router.push("/auth/otp-verify")
        
        toast.info("Verification Required", {
          description: "Please verify your account to continue.",
          duration: 5000,
          action: {
            label: "Verify Now",
            onClick: () => router.push("/auth/otp-verify")
          }
        })
      } else {
        setError(err.message || "Login failed")
      }
    }
  }

  const handleVerificationRequired = (userId: string) => {
    // Store verification data
    sessionStorage.setItem("verificationUserId", userId)
    sessionStorage.setItem("returnUrl", sessionStorage.getItem("redirectTo") || `/(user)/${userId}/dashboard`)
    
    // Navigate to verification page
    router.push("/auth/otp-verify")
    
    toast.info("Redirecting to Verification", {
      description: "Taking you to the verification page...",
      duration: 3000
    })
  }

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
            <div className="absolute inset-0 h-16 w-16 rounded-full bg-emerald-500/10 animate-pulse mx-auto" />
          </div>
          <div className="space-y-2">
            <p className="text-emerald-700 text-xl font-semibold">Signing you in...</p>
            <p className="text-emerald-600 text-sm">Please wait a moment</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="absolute -top-16 left-0 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/50"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> 
          Back to Home
        </Button>

        {/* Main Login Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="h-12 w-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-400" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-emerald-600/80 text-sm">
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Success message for verified accounts */}
          {showWelcomeBack && (
            <Alert className="bg-green-50 border-green-200 shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <span className="font-semibold">Account verified successfully!</span> You can now sign in.
              </AlertDescription>
            </Alert>
          )}

          {/* General Error Alert */}
          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200 shadow-sm">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <span className="font-semibold">Sign in failed:</span> {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <LoginForm 
            onSubmit={({ email, password }) => handleLogin(email, password)}
            onVerificationRequired={handleVerificationRequired}
          />

          {/* Footer Links */}
          <div className="space-y-4 pt-6 border-t border-emerald-100">
            <div className="text-center space-y-2">
              <p className="text-sm text-emerald-700">
                Don&apos;t have an account?{" "}
                <Link 
                  href="/auth/register" 
                  className="font-semibold text-emerald-600 hover:text-emerald-700 underline-offset-4 hover:underline transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
              
              <p className="text-sm text-emerald-600">
                Forgot your password?{" "}
                <Link 
                  href="/auth/complete-recovery" 
                  className="font-semibold text-emerald-600 hover:text-emerald-700 underline-offset-4 hover:underline transition-colors"
                >
                  Reset it here
                </Link>
              </p>
            </div>

            {/* Security Notice */}
            <div className="text-center">
              <p className="text-xs text-emerald-500 flex items-center justify-center gap-1">
                <Shield className="h-3 w-3" />
                Your data is protected with enterprise-grade security
              </p>
            </div>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-xs text-emerald-600/70">
            Having trouble signing in?{" "}
            <Link href="/support" className="underline hover:text-emerald-700 transition-colors">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
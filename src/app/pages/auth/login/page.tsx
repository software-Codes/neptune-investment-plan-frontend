/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/hooks/useAuth"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface LoginFormData {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, user } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle URL parameters and verification status
  useEffect(() => {
    const redirectTo = searchParams.get("redirectTo")
    if (redirectTo) {
      sessionStorage.setItem("redirectTo", redirectTo)
    }

    const status = searchParams.get("status")
    const message = searchParams.get("message")

    // Handle verification success
    if (status === "verified") {
      toast.success(message || "Email verified successfully!", {
        description: "You can now sign in to your account.",
        duration: 4000
      })
      cleanupUrlParams()
    }

    // Handle verification failure
    if (status === "verification-failed") {
      toast.error(message || "Verification failed", {
        description: "Please try again or request a new verification code.",
        duration: 5000
      })
      cleanupUrlParams()
    }
  }, [searchParams])

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectTo = sessionStorage.getItem("redirectTo") || "/pages/user/dashboard"
      sessionStorage.removeItem("redirectTo")
      router.push(redirectTo)
    }
  }, [user, router])

  const cleanupUrlParams = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete("status")
    url.searchParams.delete("message")
    window.history.replaceState({}, "", url.toString())
  }

  const handleLogin = async (data: LoginFormData) => {
    setError(null)
    setIsRedirecting(true)

    try {
      await login(data.email, data.password)
      // Actual redirect is handled by the useEffect above
    } catch (error: any) {
      setIsRedirecting(false)
      console.error("Login error:", error)

      if (error.requiresVerification) {
        await handleVerificationRequired(error.userId, error.email, error.preferredContactMethod)
        return
      }

      setError(error.message || "Login failed. Please check your credentials.")
    }
  }

  const handleVerificationRequired = async (
    userId: string,
    email?: string,
    preferredContactMethod: string = "email"
  ) => {
    try {
      // Store verification data
      sessionStorage.setItem("verificationUserId", userId)
      sessionStorage.setItem("verificationEmail", email || "")
      sessionStorage.setItem("preferredContactMethod", preferredContactMethod)
      sessionStorage.setItem("returnUrl", "/pages/user/dashboard")

      // Navigate to verification page
      router.push("/pages/auth/otp-verify")

      toast.info("Account verification required", {
        description: `Please verify your account via ${preferredContactMethod}.`,
        duration: 3000
      })
    } catch (error) {
      console.error("Verification redirect error:", error)
      toast.error("Navigation error", {
        description: "Unable to proceed with verification. Please try again.",
        duration: 4000
      })
    }
  }

  if (isRedirecting) {
    return (
      <div className="flex h-full w-full items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
            <div className="absolute inset-0 h-12 w-12 rounded-full bg-emerald-500/10 animate-pulse mx-auto" />
          </div>
          <div className="space-y-1">
            <p className="text-emerald-700 font-medium">Welcome back!</p>
            <p className="text-emerald-600 text-sm">Authenticating...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header Section */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-800">
            Welcome back
          </h1>
          <p className="text-emerald-600/70">
            Please enter your credentials to access your account
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-xl shadow-lg p-8">
          <LoginForm
            onSubmit={handleLogin}
            onVerificationRequired={handleVerificationRequired}
          />
        </div>

        {/* Footer Links */}
        <div className="text-center space-">
          <p className="text-sm text-emerald-600/60">
            Not a member?{" "}
            <a
              href="/pages/auth/register"
              className="text-emerald-600 hover:text-emerald-700 underline underline-offset-4 transition-colors"
            >
              Create an account
            </a>
          </p>
          {/* <p className="text-sm text-emerald-600/60">
            Forgot your password?{" "}
            <a 
              href="/pages/auth/reset-password" 
              className="text-emerald-600 hover:text-emerald-700 underline underline-offset-4 transition-colors"
            >
              Reset it here
            </a>
          </p> */}
          {/* <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Back to homepage
          </button> */}
        </div>
      </div>
    </div>
  )
}

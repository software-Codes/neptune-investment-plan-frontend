/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/hooks/useAuth"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, user } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Store redirect URL from query parameters in sessionStorage
  useEffect(() => {
    const redirectTo = searchParams.get("redirectTo")
    if (redirectTo) {
      sessionStorage.setItem("redirectTo", redirectTo)
    }
    
    // Show success message if user just completed verification
    const status = searchParams.get("status")
    const message = searchParams.get("message")
    
    if (status === "verified") {
      toast.success(message || "Email verified successfully!", {
        description: "You can now sign in to your account.",
        duration: 4000
      })
      
      // Clean up the URL
      const url = new URL(window.location.href)
      url.searchParams.delete("status")
      url.searchParams.delete("message")
      window.history.replaceState({}, "", url.toString())
    }
    
    // Handle verification failure
    if (status === "verification-failed") {
      toast.error(message || "Verification failed", {
        description: "Please try again or request a new verification code.",
        duration: 5000
      })
      
      // Clean up the URL
      const url = new URL(window.location.href)
      url.searchParams.delete("status")
      url.searchParams.delete("message")
      window.history.replaceState({}, "", url.toString())
    }
  }, [searchParams])

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectTo = sessionStorage.getItem("redirectTo") || "/pages/user/dashboard"
      sessionStorage.removeItem("redirectTo") // Clear after use
      router.push(redirectTo)
    }
  }, [user, router])

  const handleLogin = async (data: { email: string; password: string }) => {
    setError(null)
    try {
      setIsRedirecting(true)

      // This will store token in both localStorage and cookies via AuthProvider
      await login(data.email, data.password)
      
      // Note: The actual redirect is handled in the login function or by the useEffect above
      // If we reach here, it means verification is required
    } catch (error: any) {
      console.error("Login error in page:", error)
      setIsRedirecting(false)
      
      // Handle verification requirement specifically
      if (error.requiresVerification && error.userId) {
        handleVerificationRequired(error.userId)
        return
      }
      
      setError(error.message || "Login failed. Please check your credentials.")
    }
  }

  const handleVerificationRequired = async (userId: string) => {
    try {
      // Store verification data in session storage
      sessionStorage.setItem("verificationUserId", userId)
      sessionStorage.setItem("returnUrl", "/login")
      
      // Navigate to verification page
      router.push("/pages/auth/otp-verify")
      
      // Show info toast
      toast.info("Redirecting to verification", {
        description: "Please verify your account to continue.",
        duration: 3000
      })
    } catch (error) {
      console.error("Error handling verification redirect:", error)
      toast.error("Navigation error", {
        description: "Unable to redirect to verification page. Please try again.",
        duration: 4000
      })
    }
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  if (isRedirecting) {
    return (
      <div className="flex h-full w-full items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto"></div>
            <div className="absolute inset-0 h-12 w-12 rounded-full bg-emerald-500/10 animate-pulse mx-auto"></div>
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
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10 3.6C10 3.6 15.6 5.4 16.8 11.5H7.2C8.4 5.4 14 3.6 14 3.6C13.5 2.6 12.8 2 12 2C11.2 2 10.5 2.6 10 3.6Z"></path>
                  <path d="M22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12ZM12 4C7.1 4 3 8.1 3 13C3 17.9 7.1 22 12 22C16.9 22 21 17.9 21 13C21 8.1 16.9 4 12 4ZM7.9 13L10.4 15.5C10.7 15.8 11.1 15.8 11.4 15.5L13.9 13H7.9ZM16.1 13L16.9 14.8C17.1 14.9 17.2 15.1 17.2 15.3C17.2 15.4 17.1 15.6 17 15.7L15.6 17.1C15.5 17.2 15.3 17.3 15.2 17.3C15 17.3 14.8 17.2 14.7 17.1L13.3 15.7C13.2 15.6 13.1 15.4 13.1 15.3C13.1 15.1 13.2 14.9 13.4 14.8L14.1 13H16.1ZM12 11C12.6 11 13 10.6 13 10C13 9.4 12.6 9 12 9C11.4 9 11 9.4 11 10C11 10.6 11.4 11 12 11Z"></path>
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Login Form Container */}
        <div className="bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-xl shadow-lg p-8">
          <LoginForm 
            onSubmit={handleLogin} 
            onVerificationRequired={handleVerificationRequired}
          />
        </div>

        {/* Additional Info */}
        <div className="text-center space-y-2">
          <p className="text-sm text-emerald-600/60">
            Not a member?{" "}
            <a 
              href="/pages/auth/register" 
              className="text-emerald-600 hover:text-emerald-700 underline underline-offset-4 transition-colors"
            >
              Create an account
            </a>
          </p>
          <p className="text-sm text-emerald-600/60">
            Having trouble signing in?{" "}
            <a 
              href="/support" 
              className="text-emerald-600 hover:text-emerald-700 underline underline-offset-4 transition-colors"
            >
              Get help
            </a>
          </p>
          <button
            type="button"
            className="text-sm text-gray-500 hover:text-gray-700"
            onClick={handleBackToHome}
          >
            Back to homepage
          </button>
        </div>
      </div>
    </div>
  )
}

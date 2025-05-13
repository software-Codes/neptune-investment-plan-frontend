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

  // Show success message if user just completed verification
  useEffect(() => {
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

  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      await login(data.email, data.password)
      const redirectTo = searchParams.get("redirectTo") || "/dashboard"
      
      // Add slight delay for better UX
      setIsRedirecting(true)
      setTimeout(() => {
        router.push(redirectTo)
      }, 1000)
    } catch (error: any) {
      // Error handling is managed by the LoginForm component and AuthProvider
      console.error('Login error in page:', error)
      throw error
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
            <p className="text-emerald-600 text-sm">Redirecting to dashboard...</p>
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
            Having trouble signing in?{" "}
            <a 
              href="/support" 
              className="text-emerald-600 hover:text-emerald-700 underline underline-offset-4 transition-colors"
            >
              Get help
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
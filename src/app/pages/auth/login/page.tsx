"use client"

import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function LoginPage() {
  const router = useRouter()
  const { login, user } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      setIsRedirecting(true)
      router.push("/dashboard")
    }
  }, [user, router])

  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      await login(data.email, data.password)
      router.push("/dashboard") // Redirect to dashboard after successful login
    } catch (error) {
      // Error handling is managed by the LoginForm component
      throw error
    }
  }

  if (isRedirecting) {
    return (
      <div className="flex h-full w-full items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto"></div>
          <p className="text-emerald-700">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-emerald-800">
          Welcome back
        </h1>
        <p className="text-emerald-600/70">
          Please enter your credentials to access your account
        </p>
      </div>

      {/* Login Form */}
      <LoginForm onSubmit={handleLogin} />
    </div>
  )
}
"use client"

import { RegisterForm } from '@/components/auth/register-form'
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { RegistrationData } from '@/types/type'

export default function SignupPage() {
  const router = useRouter()
  const { register, user } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      setIsRedirecting(true)
      router.push("/dashboard")
    }
  }, [user, router])

  const handleRegistration = async (data: RegistrationData) => {
    try {
      await register(data)
      // Redirect happens in the register function after successful registration
    } catch (error) {
      // Error handling is managed by the RegisterForm component
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
          Create an Account
        </h1>
        <p className="text-emerald-600/70">
          Please fill in your information to create your account
        </p>
      </div>

      {/* Registration Form */}
      <RegisterForm onSubmit={handleRegistration} />
    </div>
  )
}

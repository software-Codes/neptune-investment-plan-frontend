/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api-client'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react'

// Form validation schemas
const initiateRecoverySchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" })
})

const completeRecoverySchema = z.object({
  otpCode: z.string().length(6, {
    message: "OTP must be exactly 6 digits.",
  }),
  newPassword: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
})

type InitiateRecoveryFormValues = z.infer<typeof initiateRecoverySchema>
type CompleteRecoveryFormValues = z.infer<typeof completeRecoverySchema>

export default function CompleteRecoveryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [recoveryStep, setRecoveryStep] = useState<'initiate' | 'complete'>('initiate')
  const [recoveryData, setRecoveryData] = useState<{
    email: string;
    userId: string;
    method?: 'email' | 'phone';
    destination?: string;
  } | null>(null)

  const initiateForm = useForm<InitiateRecoveryFormValues>({
    resolver: zodResolver(initiateRecoverySchema),
    defaultValues: {
      email: "",
    },
  })

  const completeForm = useForm<CompleteRecoveryFormValues>({
    resolver: zodResolver(completeRecoverySchema),
    defaultValues: {
      otpCode: "",
      newPassword: "",
    },
  })

  // Check for existing recovery data in session storage
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('resetEmail')
    const storedUserId = sessionStorage.getItem('resetUserId')
    const storedMethod = sessionStorage.getItem('resetMethod')
    const storedDestination = sessionStorage.getItem('resetDestination')

    if (storedEmail && storedUserId) {
      setRecoveryData({
        email: storedEmail,
        userId: storedUserId,
        method: storedMethod as 'email' | 'phone',
        destination: storedDestination || undefined
      })
      setRecoveryStep('complete')
    }
  }, [])

  /**
   * Initiates the password reset process by requesting an OTP
   * @param {InitiateRecoveryFormValues} data - User email for password reset
   */
  const handleInitiateRecovery = async (data: InitiateRecoveryFormValues) => {
    setIsLoading(true)
    try {
      const response = await authApi.requestPasswordReset(data.email)

      // Store recovery data in session storage
      sessionStorage.setItem('resetEmail', data.email)
      sessionStorage.setItem('resetUserId', response.userId)
      sessionStorage.setItem('resetMethod', response.method)
      sessionStorage.setItem('resetDestination', response.destination)

      // Update recovery data state
      setRecoveryData({
        email: data.email,
        userId: response.userId,
        method: response.method,
        destination: response.destination
      })

      // Move to complete recovery step
      setRecoveryStep('complete')

      toast.success("Recovery instructions sent!", {
        description: `OTP sent to ${response.destination}. Check your ${response.method}.`
      })
    } catch (error: any) {
      toast.error("Recovery request failed", {
        description: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Completes the password reset process by verifying OTP and setting new password
   * @param {CompleteRecoveryFormValues} data - OTP and new password details
   */
  const handleCompleteRecovery = async (data: CompleteRecoveryFormValues) => {
    if (!recoveryData?.userId) {
      toast.error("Recovery session expired", {
        description: "Please start the recovery process again."
      })
      return
    }

    setIsLoading(true)
    try {
      await authApi.completePasswordReset(
        recoveryData.userId, 
        data.otpCode, 
        data.newPassword
      )

      // Clear recovery data from session storage
      sessionStorage.removeItem('resetEmail')
      sessionStorage.removeItem('resetUserId')
      sessionStorage.removeItem('resetMethod')
      sessionStorage.removeItem('resetDestination')

      toast.success("Password Reset Successful", {
        description: "You can now log in with your new password."
      })

      // Redirect to login page
      router.push('/pages/auth/login')
    } catch (error: any) {
      toast.error("Password Reset Failed", {
        description: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Resends the OTP for password recovery
   */
  const handleResendCode = async () => {
    if (!recoveryData?.email) {
      toast.error("Recovery session expired", {
        description: "Please start the recovery process again."
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await authApi.requestPasswordReset(recoveryData.email)

      // Update stored user ID in case it changed
      sessionStorage.setItem('resetUserId', response.userId)

      toast.success("Code Resent!", {
        description: `New OTP sent to ${recoveryData.destination}`
      })
    } catch (error: any) {
      toast.error("Failed to resend code", {
        description: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Masks the destination email or phone number for privacy
   * @param {string | undefined} destination - Email or phone to mask
   * @returns {string} Masked contact information
   */
  const maskDestination = (destination?: string): string => {
    if (!destination) return "your contact method"
    
    // Email masking
    if (destination.includes('@')) {
      const [local, domain] = destination.split('@')
      return `${local[0]}****${local.slice(-1)}@${domain}`
    }
    
    // Phone number masking
    return destination.slice(0, -4).replace(/\d/g, '*') + destination.slice(-4)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-xl border-emerald-100/50">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => router.push('/pages/auth/login')}
              className="hover:bg-emerald-100/50"
            >
              <ArrowLeft className="h-5 w-5 text-emerald-600" />
            </Button>
            <CardTitle className="text-2xl font-bold text-emerald-800">
              {recoveryStep === 'initiate' ? 'Forgot Password' : 'Reset Password'}
            </CardTitle>
          </div>
          <CardDescription className="text-emerald-600/70">
            {recoveryStep === 'initiate' 
              ? "Enter your email to start the password reset process."
              : `Enter the OTP sent to ${maskDestination(recoveryData?.destination)}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recoveryStep === 'initiate' ? (
            <Form {...initiateForm}>
              <form onSubmit={initiateForm.handleSubmit(handleInitiateRecovery)} className="space-y-6">
                <FormField
                  control={initiateForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-emerald-800 font-medium">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-5 w-5 text-emerald-600/50" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10 h-12 border-emerald-200 bg-emerald-50/50 text-emerald-900 placeholder:text-emerald-400 focus:border-emerald-500 focus:ring-emerald-500"
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {isLoading && (
                    <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  {isLoading ? "Sending Instructions..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...completeForm}>
              <form onSubmit={completeForm.handleSubmit(handleCompleteRecovery)} className="space-y-6">
              
<FormField
  control={completeForm.control}
  name="otpCode"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-emerald-800 font-medium">
        Recovery Code
      </FormLabel>
      <FormControl>
        <div className="relative">
          <Input
            {...field}
            type="text"
            placeholder="Enter 6-digit OTP"
            className="h-12 border-emerald-200 bg-emerald-50/50 text-emerald-900 focus:border-emerald-500 focus:ring-emerald-500 tracking-[0.5em] text-center"
            disabled={isLoading}
            maxLength={6}
            pattern="\d{6}"
            inputMode="numeric"
            autoComplete="one-time-code"
            onChange={(e) => {
              // Only allow numeric input
              const value = e.target.value.replace(/\D/g, '');
              field.onChange(value);
            }}
          />
        </div>
      </FormControl>
      <FormMessage className="text-red-500 text-sm" />
    </FormItem>
  )}
/>

                <FormField
                  control={completeForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-emerald-800 font-medium">
                        New Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-5 w-5 text-emerald-600/50" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            className="pl-10 h-12 border-emerald-200 bg-emerald-50/50 text-emerald-900 focus:border-emerald-500 focus:ring-emerald-500"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-emerald-600/50 hover:text-emerald-600"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />


                <div className="space-y-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {isLoading && (
                      <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
                    )}
                    {isLoading ? "Resetting Password..." : "Reset Password"}
                  </Button>

                  <Button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full h-12"
                  >
                    {isLoading && (
                      <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
                    )}
                    Resend Recovery Code
                  </Button>
                </div>
              </form>
            </Form>
          )}

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => router.push('/pages/auth/login')}
              className="text-emerald-600 hover:text-emerald-700"
            >
              Remember your password? Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
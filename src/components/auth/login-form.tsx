/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Icons } from "@/components/ui/icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  X, 
  ShieldCheck, 
  Loader2, 
  Mail, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  Smartphone,
  Clock,
  Shield
} from "lucide-react"
import { authApi } from "@/lib/api/api-client"
import Link from "next/link"

// Define the form validation schema
const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
})

type LoginFormValues = z.infer<typeof loginFormSchema>

interface LoginFormProps extends Omit<React.ComponentPropsWithoutRef<"div">, "onSubmit"> {
  onSubmit?: (data: LoginFormValues) => Promise<void>
  onVerificationRequired?: (userId: string) => void
}

export function LoginForm({ className, onSubmit, onVerificationRequired, ...props }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showVerificationAlert, setShowVerificationAlert] = useState(false)
  const [userData, setUserData] = useState<{ userId: string, email: string, method?: string } | null>(null)
  const [resendingCode, setResendingCode] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Cooldown timer for resend button
  const startCooldown = () => {
    setResendCooldown(60)
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  async function handleSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setError(null)
    setShowVerificationAlert(false)
    setUserData(null)

    try {
      if (onSubmit) {
        await onSubmit(data)
      }
    } catch (error: any) {
      console.error('Login error details:', error);

      // Check if the error is due to verification requirement
      if (error.requiresVerification && error.userId) {
        setShowVerificationAlert(true)
        setUserData({ 
          userId: error.userId, 
          email: data.email,
          method: error.preferredContactMethod || 'email'
        })
        setError(null) // Clear generic error since we're showing verification alert

        toast.error("Account Verification Required", {
          description: "Please verify your account to continue",
          duration: 5000,
          action: {
            label: "Verify Now",
            onClick: () => onVerificationRequired?.(error.userId)
          }
        })
      } else {
        const message = error.message || "Something went wrong"
        setError(message)
        setShowVerificationAlert(false)

        toast.error("Login failed", {
          description: message,
          duration: 4000
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!userData?.userId || resendCooldown > 0) return;

    try {
      setResendingCode(true)
      await authApi.resendOTP(userData.userId, userData.email, userData.method)
      
      toast.success("Verification Code Sent!", {
        description: `A new code has been sent to your ${userData.method === 'phone' ? 'phone' : 'email'}`,
        duration: 5000,
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
      })
      
      startCooldown()
    } catch (error: any) {
      const message = error instanceof Error ? error.message : "Failed to send verification code"
      toast.error("Failed to send code", {
        description: message,
        duration: 4000
      })
    } finally {
      setResendingCode(false)
    }
  }

  const  handleVerifyAccount = () => {
    if (userData?.userId && onVerificationRequired) {
      onVerificationRequired(userData.userId)
    }
  }

  const getMethodIcon = (method?: string) => {
    return method === 'phone' ? (
      <Smartphone className="h-5 w-5 text-blue-600" />
    ) : (
      <Mail className="h-5 w-5 text-blue-600" />
    )
  }

  const getMethodText = (method?: string) => {
    return method === 'phone' ? 'phone number' : 'email address'
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {/* Generic Error Alert */}
      {error && !showVerificationAlert && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 shadow-sm">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800 font-semibold">Login Failed</AlertTitle>
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Enhanced Verification Required Alert */}
      {showVerificationAlert && userData && (
        <div className="space-y-4">
          <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-lg rounded-xl overflow-hidden">
            <div className="flex items-start space-x-4 p-1">
              <div className="flex-shrink-0">
                <div className="relative">
                  <Shield className="h-8 w-8 text-amber-600" />
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <AlertTitle className="text-amber-900 font-bold text-lg mb-2 flex items-center gap-2">
                  Account Verification Required
                  <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse"></div>
                </AlertTitle>
                
                <AlertDescription className="space-y-4">
                  <div className="text-amber-800 space-y-2">
                    <p className="text-sm leading-relaxed">
                      Your account <span className="font-semibold text-amber-900">{userData.email}</span> needs 
                      to be verified before you can sign in.
                    </p>
                    
                    <div className="flex items-center space-x-2 text-sm text-amber-700 bg-amber-100/50 p-3 rounded-lg">
                      {getMethodIcon(userData.method)}
                      <span>
                        Verification code will be sent to your {getMethodText(userData.method)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      onClick={handleVerifyAccount}
                      size="sm"
                      className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 flex-1 sm:flex-none"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Verify Account Now
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      onClick={handleResendVerification}
                      variant="outline"
                      size="sm"
                      disabled={resendingCode || resendCooldown > 0}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 transition-all duration-200 flex items-center gap-2 flex-1 sm:flex-none"
                    >
                      {resendingCode ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : resendCooldown > 0 ? (
                        <>
                          <Clock className="h-4 w-4" />
                          Wait {resendCooldown}s
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          Resend Code
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Help Text */}
                  <div className="text-xs text-amber-600 bg-amber-100/30 p-2 rounded-md border border-amber-200/50">
                    <p className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      Need help? Check your spam folder or contact support if you don&apos;t receive the code.
                    </p>
                  </div>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        </div>
      )}

      {/* Login Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-emerald-800 font-medium">Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="m@example.com"
                    disabled={isLoading}
                    className="h-12 border-emerald-200 bg-emerald-50/50 text-emerald-900 placeholder:text-emerald-400 focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-emerald-800 font-medium">Password</FormLabel>
                  <Link
                    href="/auth/complete-recovery"
                    className="text-sm text-emerald-600 hover:text-emerald-700 underline-offset-4 hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    disabled={isLoading}
                    className="h-12 border-emerald-200 bg-emerald-50/50 text-emerald-900 focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
            )}
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
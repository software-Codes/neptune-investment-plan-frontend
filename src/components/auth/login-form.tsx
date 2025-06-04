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
  Shield,
  Lock,
  Eye,
  EyeOff
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
  const [showPassword, setShowPassword] = useState(false)

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
      console.error('Login error details:', error)

      // Check if the error is due to verification requirement
      if (error.requiresVerification && (error.userId || error.user_id)) {
        setShowVerificationAlert(true)
        setUserData({ 
          userId: error.userId || error.user_id, 
          email: data.email,
          method: error.preferredContactMethod || error.preferred_contact_method || 'email'
        })
        setError(null) // Clear generic error since we're showing verification alert

        // Optional: Add console.log to debug
        console.log('Setting verification alert:', {
          showVerificationAlert: true,
          userData: {
            userId: error.userId || error.user_id,
            email: data.email,
            method: error.preferredContactMethod || error.preferred_contact_method || 'email'
          }
        })

        if (onVerificationRequired) {
          onVerificationRequired(error.userId || error.user_id)
        }
      } else {
        const message = error.message || "Something went wrong"
        setError(message)
        setShowVerificationAlert(false)
        setUserData(null)  // Ensure userData is cleared for non-verification errors

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

  const handleVerifyAccount = () => {
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
    <div className={cn("space-y-6", className)} {...props}>
      {/* Generic Error Alert */}
      {error && !showVerificationAlert && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-red-800 dark:text-red-200 font-semibold">Login Failed</AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
        </Alert>
      )}

      {/* Enhanced Verification Required Alert */}
      {showVerificationAlert && userData && (
        <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-lg rounded-xl overflow-hidden dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-800">
          <div className="flex items-start space-x-4 p-1">
            <div className="flex-shrink-0">
              <div className="relative">
                <Shield className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <AlertTitle className="text-amber-900 dark:text-amber-100 font-bold text-lg mb-2 flex items-center gap-2">
                Account Verification Required
                <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse"></div>
              </AlertTitle>
              
              <AlertDescription className="space-y-4">
                <div className="text-amber-800 dark:text-amber-200 space-y-2">
                  <p className="text-sm leading-relaxed">
                    Your account <span className="font-semibold text-amber-900 dark:text-amber-100">{userData.email}</span> needs 
                    to be verified before you can sign in.
                  </p>
                  
                  <div className="flex items-center space-x-2 text-sm text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-800/30 p-3 rounded-lg">
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
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30 transition-all duration-200 flex items-center gap-2 flex-1 sm:flex-none"
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
                <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-100/30 dark:bg-amber-800/20 p-2 rounded-md border border-amber-200/50 dark:border-amber-700/50">
                  <p className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    Need help? Check your spam folder or contact support if you don&apos;t receive the code.
                  </p>
                </div>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* Login Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 flex items-center gap-2 font-medium">
                  <Mail className="w-4 h-4" />
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="john@example.com"
                    disabled={isLoading}
                    className="h-12 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-600 dark:text-red-400" />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-slate-700 dark:text-slate-300 flex items-center gap-2 font-medium">
                    <Lock className="w-4 h-4" />
                    Password
                  </FormLabel>
                  <Link
                    href="/auth/complete-recovery"
                    className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 underline-offset-4 hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="h-12 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-800 pr-12 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-sm text-red-600 dark:text-red-400" />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>Sign in</span>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  →
                </div>
              </div>
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
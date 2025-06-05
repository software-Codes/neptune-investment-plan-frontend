/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/api-client'
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
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Shield, KeyRound, CheckCircle } from 'lucide-react'
import { PasswordStrength } from '@/components/ui/password-strength'

// Form validation schemas
const initiateRecoverySchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" })
})

const completeRecoverySchema = z.object({
  otpCode: z.string()
    .length(6, { message: "Recovery code must be exactly 6 digits" })
    .regex(/^\d+$/, { message: "Recovery code must contain only numbers" }),
  newPassword: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Include at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Include at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Include at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Include at least one special character" }),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type InitiateRecoveryFormValues = z.infer<typeof initiateRecoverySchema>
type CompleteRecoveryFormValues = z.infer<typeof completeRecoverySchema>

export default function CompleteRecoveryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
      otpCode: "",       // ← ensures field.value starts as ""
      newPassword: "",
      confirmPassword: "",
    },
  });
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
   */
  const handleInitiateRecovery = async (data: InitiateRecoveryFormValues) => {
    setIsLoading(true)
    try {
      const response = await authApi.requestPasswordReset(data.email)

      sessionStorage.setItem('resetEmail', data.email)
      sessionStorage.setItem('resetUserId', response.userId)
      sessionStorage.setItem('resetMethod', response.method)
      sessionStorage.setItem('resetDestination', response.destination)

      setRecoveryData({
        email: data.email,
        userId: response.userId,
        method: response.method as 'email' | 'phone',
        destination: response.destination
      })

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
   * Completes the password reset process
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

      sessionStorage.removeItem('resetEmail')
      sessionStorage.removeItem('resetUserId')
      sessionStorage.removeItem('resetMethod')
      sessionStorage.removeItem('resetDestination')

      toast.success("Password Reset Successful", {
        description: "You can now log in with your new password."
      })

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
    try {
      const resetState = JSON.parse(sessionStorage.getItem('passwordResetState') || '{}');

      if (resetState.lastAttempt) {
        const timeSinceLastAttempt = Date.now() - new Date(resetState.lastAttempt).getTime();
        const cooldownPeriod = resetState.attempts > 3 ? 300000 : 60000;

        if (timeSinceLastAttempt < cooldownPeriod) {
          const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastAttempt) / 60000);
          toast.error(`Please wait ${remainingTime} minutes before requesting another code`);
          return;
        }
      }

      setIsLoading(true);
      const response = await authApi.requestPasswordReset(resetState.email);

      resetState.attempts += 1;
      resetState.lastAttempt = new Date();
      sessionStorage.setItem('passwordResetState', JSON.stringify(resetState));

      toast.success("New code sent!", {
        description: `Code sent to ${response.destination}`
      });
    } catch (error: any) {
      toast.error("Failed to resend code", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Masks the destination email or phone number for privacy
   */
  const maskDestination = (destination?: string): string => {
    if (!destination) return "your contact method"

    if (destination.includes('@')) {
      const [local, domain] = destination.split('@')
      return `${local[0]}****${local.slice(-1)}@${domain}`
    }

    return destination.slice(0, -4).replace(/\d/g, '*') + destination.slice(-4)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md lg:max-w-lg">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl mb-4 shadow-lg">
            {recoveryStep === 'initiate' ? (
              <KeyRound className="w-8 h-8 text-white" />
            ) : (
              <Shield className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {recoveryStep === 'initiate' ? 'Forgot Password?' : 'Reset Password'}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            {recoveryStep === 'initiate'
              ? "No worries! Enter your email and we'll send you recovery instructions."
              : `We've sent a verification code to ${maskDestination(recoveryData?.destination)}`}
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/pages/auth/login')}
                className="hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
              </Button>
              <div>
                <CardTitle className="text-xl sm:text-2xl text-slate-900 dark:text-white">
                  {recoveryStep === 'initiate' ? 'Email Verification' : 'Security Verification'}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300 mt-1">
                  {recoveryStep === 'initiate'
                    ? "We'll verify your identity first"
                    : "Complete the verification process"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            {recoveryStep === 'initiate' ? (
              <Form {...initiateForm}>
                <form onSubmit={initiateForm.handleSubmit(handleInitiateRecovery)} className="space-y-6">
                  <FormField
                    control={initiateForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold text-sm sm:text-base">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500 group-focus-within:text-green-600 transition-colors" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="you@example.com"
                              className="pl-12 h-12 sm:h-14 border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/20 rounded-xl transition-all duration-200 text-base"
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
                    className="w-full h-12 sm:h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-3 h-5 w-5 animate-spin" />
                        Sending Instructions...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-3 h-5 w-5" />
                        Send Recovery Code
                      </>
                    )}
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
      <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold text-sm sm:text-base">
        Verification Code
      </FormLabel>
      <FormControl>
        <div className="relative">
          <Input
            {...field}
            type="text"
            placeholder="000000"
            className="h-14 sm:h-16 border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/20 rounded-xl tracking-[0.5em] text-center font-mono text-xl sm:text-2xl font-bold transition-all duration-200"
            maxLength={6}
            inputMode="numeric"
            pattern="[0-9]*"
            // CRITICAL: These autocomplete attributes prevent email autofill
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            // Prevent browser from suggesting emails or other data
            data-lpignore="true"
            data-form-type="other"
            disabled={isLoading}
            // Simplified onChange - only allow digits, max 6 characters
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
              field.onChange(value);
            }}
            // Handle paste - clean and limit to 6 digits
            onPaste={(e) => {
              e.preventDefault();
              const pastedText = e.clipboardData.getData('text');
              const digitsOnly = pastedText.replace(/[^0-9]/g, '').slice(0, 6);
              field.onChange(digitsOnly);
            }}
            // Simplified keyDown handler - allow more keys
            onKeyDown={(e) => {
              // Allow: digits, backspace, delete, arrow keys, tab, enter
              const allowedKeys = [
                'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 
                'ArrowUp', 'ArrowDown', 'Tab', 'Enter', 'Home', 'End'
              ];
              
              const isDigit = /^[0-9]$/.test(e.key);
              const isAllowedKey = allowedKeys.includes(e.key);
              
              // Prevent if it's not a digit or allowed key
              if (!isDigit && !isAllowedKey) {
                e.preventDefault();
              }
              
              // Also prevent if we already have 6 digits and trying to add more
              if (isDigit && field.value && field.value.length >= 6) {
                e.preventDefault();
              }
            }}
            // Clear field on focus if it contains non-digits (like email)
            onFocus={(e) => {
              const currentValue = e.target.value;
              if (currentValue && !/^[0-9]*$/.test(currentValue)) {
                field.onChange('');
              }
            }}
          />
        </div>
      </FormControl>
      <FormMessage className="text-red-500 text-sm" />
    </FormItem>
  )}
/>
               

                  {/* New Password Field */}
                  <FormField
                    control={completeForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold text-sm sm:text-base">
                          New Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500 group-focus-within:text-green-600 transition-colors" />
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a strong password"
                              className="pl-12 pr-12 h-12 sm:h-14 border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/20 rounded-xl transition-all duration-200 text-base"
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-green-600 transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </FormControl>
                        <PasswordStrength password={field.value} />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password Field */}
                  <FormField
                    control={completeForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-slate-200 font-semibold text-sm sm:text-base">
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <CheckCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500 group-focus-within:text-green-600 transition-colors" />
                            <Input
                              {...field}
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              className="pl-12 pr-12 h-12 sm:h-14 border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:border-green-500 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900/20 rounded-xl transition-all duration-200 text-base"
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-green-600 transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Action Buttons */}
                  <div className="space-y-4 pt-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 sm:h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      {isLoading ? (
                        <>
                          <Icons.spinner className="mr-3 h-5 w-5 animate-spin" />
                          Resetting Password...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-3 h-5 w-5" />
                          Reset Password
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      onClick={handleResendCode}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full h-12 sm:h-14 border-2 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all duration-200 text-base font-medium"
                    >
                      {isLoading ? (
                        <>
                          <Icons.spinner className="mr-3 h-5 w-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-3 h-5 w-5" />
                          Resend Code
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-600 text-center">
              <Button
                variant="link"
                onClick={() => router.push('/pages/auth/login')}
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium text-base"
              >
                Remember your password? Sign in
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm">Security Notice</h4>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                For your security, this recovery code will expire in 15 minutes. If you don&apos;t receive it, check your spam folder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
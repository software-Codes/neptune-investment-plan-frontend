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
import { X, ShieldCheck, Loader2, Mail, ArrowRight, RefreshCw } from "lucide-react"
import { authApi } from "@/lib/api-client"

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
  const [userData, setUserData] = useState<{ userId: string, email: string } | null>(null)
  const [resendingCode, setResendingCode] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function handleSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setError(null)
    setShowVerificationAlert(false)
    setUserData(null)

    // Add debugging
    console.log('Login attempt:', {
      email: data.email,
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    });

    try {
      if (onSubmit) {
        await onSubmit(data)
      }
    } catch (error: any) {
      console.error('Login error details:', error);
      console.log('Error properties:', {
        requiresVerification: error.requiresVerification,
        userId: error.userId,
        statusCode: error.statusCode,
        message: error.message
      });

      // Check if the error is due to verification requirement
      if (error.requiresVerification && error.userId) {
        console.log('Setting verification alert with userId:', error.userId);
        setShowVerificationAlert(true)
        setUserData({ userId: error.userId, email: data.email })
        setError(null) // Clear generic error since we're showing verification alert

        // Show toast notification
        toast.error("Account not verified", {
          description: "Please verify your email before signing in."
        })
      } else {
        console.log('Setting generic error message');
        const message = error instanceof Error ? error.message : "Something went wrong"
        setError(message)
        setShowVerificationAlert(false)

        // Show toast for other errors
        toast.error("Login failed", {
          description: message
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // const handleResendVerification = async () => {
  //   if (!userData?.userId) return;

  //   try {
  //     setResendingCode(true)
  //     await authApi.resendOTP(userData.userId)
  //     toast.success("Verification code sent!", {
  //       description: `A new verification code has been sent to ${userData.email}`
  //     })
  //   } catch (error: any) {
  //     const message = error instanceof Error ? error.message : "Failed to send verification code"
  //     toast.error("Failed to send code", {
  //       description: message
  //     })
  //   } finally {
  //     setResendingCode(false)
  //   }
  // }

  const handleVerifyAccount = () => {
    if (userData?.userId && onVerificationRequired) {
      onVerificationRequired(userData.userId)
    }
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      {/* Generic Error Alert */}
      {error && !showVerificationAlert && (
        <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200 text-red-800">
          <div className="flex justify-between items-start">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-4 w-4 text-red-600" />
              </div>
              <div className="ml-3">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </Alert>
      )}

      {/* Verification Required Alert */}
      {showVerificationAlert && userData && (
        <Alert className="mb-6 bg-amber-50 border-amber-200 text-amber-800">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-amber-600 mt-0.5" />
            </div>
            <div className="ml-3 flex-1">
              <AlertTitle className="text-sm font-semibold text-amber-800">
                Email Verification Required
              </AlertTitle>
              <AlertDescription className="mt-2 text-sm text-amber-700">
                <p className="mb-4">
                  Your account <strong>{userData.email}</strong> needs to be verified before you can sign in.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleVerifyAccount}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Verify Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  {/* <Button
                    onClick={handleResendVerification}
                    variant="outline"
                    size="sm"
                    disabled={resendingCode}
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                  >
                    {resendingCode ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Resend Code
                      </>
                    )}
                  </Button> */}
                </div>
              </AlertDescription>
            </div>
            <button
              onClick={() => setShowVerificationAlert(false)}
              className="text-amber-400 hover:text-amber-600 transition-colors ml-2 flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 w-">
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
                  <a
                    href="/pages/auth/complete-recovery"
                    className="text-sm text-emerald-600 hover:text-emerald-700 underline-offset-4 hover:underline transition-colors"
                  >
                    Forgot password?
                  </a>
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
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
            )}
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>

      {/* <div className="relative py-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-emerald-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-sm text-emerald-600/70">or</span>
        </div>
      </div> */}

      {/* <div className="text-center text-sm text-emerald-600/80">
        Don&apos;t have an account?{" "}
        <a
          href="/pages/auth/register"
          className="text-emerald-600 font-medium hover:text-emerald-700 underline underline-offset-4 transition-colors"
        >
          Sign up
        </a>
      </div> */}

      {/* <div className="text-balance text-center text-xs text-emerald-600/60 leading-relaxed">
        By clicking continue, you agree to our{" "}
        <a href="#" className="text-emerald-600 hover:text-emerald-700 underline underline-offset-4 transition-colors">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-emerald-600 hover:text-emerald-700 underline underline-offset-4 transition-colors">
          Privacy Policy
        </a>
        .
      </div> */}
    </div>
  )
}
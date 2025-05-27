/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/auth/verify-otp.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { authApi } from "@/lib/api/api-client"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"
import { Loader2, ArrowLeft, Mail, Clock, Timer, CheckCircle2, AlertCircle, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"

export default function VerifyOTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verificationData } = useAuth()
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [preferredContactMethod, setPreferredContactMethod] = useState<'email' | 'sms'>('email')
  const [showError, setShowError] = useState(false)
  const initializationRef = useRef(false)

  // More robust data initialization
  useEffect(() => {
    // Prevent double initialization
    if (initializationRef.current) return
    initializationRef.current = true

    const initializeData = async () => {
      try {
        console.log("Initializing OTP verification page...")
        console.log("verificationData:", verificationData)
        console.log("searchParams:", Object.fromEntries(searchParams.entries()))
        
        let userIdToUse: string | null = null
        let emailToUse: string | null = null
        let contactMethod: 'email' | 'sms' = 'email'

        // 1. First check URL params (highest priority)
        userIdToUse = searchParams.get("userId")
        emailToUse = searchParams.get("email")
        
        console.log("From URL params:", { userIdToUse, emailToUse })

        // 2. Then check verification data from AuthProvider
        if (!userIdToUse && verificationData?.userId) {
          userIdToUse = verificationData.userId
        }
        if (!emailToUse && verificationData?.email) {
          emailToUse = verificationData.email
        }
        
        console.log("After AuthProvider:", { userIdToUse, emailToUse })

        // 3. Check localStorage as backup
        if (!userIdToUse) {
          userIdToUse = localStorage.getItem("tempUserId")
        }
        if (!emailToUse) {
          emailToUse = localStorage.getItem("tempEmail")
        }
        
        console.log("After localStorage:", { userIdToUse, emailToUse })

        // 4. Check sessionStorage as last resort
        if (!userIdToUse) {
          userIdToUse = sessionStorage.getItem("verificationUserId")
        }
        if (!emailToUse) {
          emailToUse = sessionStorage.getItem("verificationEmail")
        }
        
        console.log("After sessionStorage:", { userIdToUse, emailToUse })

        // Get contact method preference
        const storedContactMethod = sessionStorage.getItem("preferredContactMethod")
        if (storedContactMethod === 'sms' || storedContactMethod === 'email') {
          contactMethod = storedContactMethod
        }

        // Set the data
        setUserId(userIdToUse)
        setEmail(emailToUse)
        setPreferredContactMethod(contactMethod)

        // If we have userId, start countdown
        if (userIdToUse) {
          setCountdown(30)
          setShowError(false)
        } else {
          console.warn("No user ID found after initialization")
          setShowError(true)
          setError("Unable to find user verification data. Please try logging in again.")
        }
      } catch (error) {
        console.error("Error initializing OTP verification:", error)
        setShowError(true)
        setError("An error occurred while loading verification page")
      } finally {
        setIsInitializing(false)
      }
    }

    initializeData()
  }, [verificationData, searchParams])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Format countdown display
  const formatCountdown = (seconds: number) => {
    if (seconds <= 0) return null
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`
  }

  const handleOTPComplete = async (value: string) => {
    setOtp(value)
    await handleSubmit(value)
  }

  const handleSubmit = async (otpValue: string = otp) => {
    if (!userId) {
      setError("User ID not found. Please try logging in again.")
      return
    }

    if (!otpValue || otpValue.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      console.log("Verifying OTP:", { userId, otpCode: otpValue })
      
      await authApi.verifyOTP(userId, otpValue)

      toast.success("Email verified successfully!", {
        description: "Your account has been verified. Redirecting to login...",
        duration: 3000
      })

      // Clear all temporary storage
      sessionStorage.removeItem("verificationUserId")
      sessionStorage.removeItem("verificationEmail")
      sessionStorage.removeItem("preferredContactMethod")
      localStorage.removeItem("tempUserId")
      localStorage.removeItem("tempEmail")
      
      // Get return URL or default to login
      const returnUrl = sessionStorage.getItem("returnUrl") || "/login"
      sessionStorage.removeItem("returnUrl")

      // Redirect with success status
      router.push(`${returnUrl}?status=verified`)
    } catch (error: any) {
      console.error("OTP verification error:", error)
      
      let errorMessage = "Verification failed"
      
      if (error.message) {
        if (error.message.includes("Invalid or expired")) {
          errorMessage = "Invalid or expired code. Please try again or request a new code."
        } else if (error.message.includes("User not found")) {
          errorMessage = "Account not found. Please try registering again."
          // Don't auto-redirect, let user decide
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
      setOtp("") // Clear the OTP input
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    if (!userId || countdown > 0 || isResending) return

    setIsResending(true)
    setError(null)

    try {
      console.log("Resending OTP for user:", userId)
      
      await authApi.resendOTP(userId)
      
      toast.success("Verification code sent!", {
        description: `New code sent via ${preferredContactMethod}`,
        duration: 3000
      })
      
      setCountdown(60) // 60 second cooldown for resend
      setOtp("") // Clear current input
    } catch (error: any) {
      console.error("Resend OTP error:", error)
      
      let errorMessage = "Failed to resend code"
      
      if (error.message) {
        if (error.message.includes("already verified")) {
          errorMessage = "Account is already verified"
          // Don't auto-redirect, let user decide
        } else if (error.message.includes("User not found")) {
          errorMessage = "Account not found. Please try registering again."
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsResending(false)
    }
  }

  const handleBack = () => {
    router.push("/login")
  }

  const handleRetry = () => {
    setError(null)
    setShowError(false)
    setIsInitializing(true)
    initializationRef.current = false
    
    // Trigger re-initialization
    setTimeout(() => {
      setIsInitializing(false)
    }, 500)
  }

  const maskEmail = (email: string | null) => {
    if (!email) return "your email"
    const [local, domain] = email.split("@")
    if (!local || !domain) return email
    const maskedLocal = local.length > 2 
      ? local[0] + "*".repeat(local.length - 2) + local[local.length - 1]
      : local
    return `${maskedLocal}@${domain}`
  }

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-emerald-700 text-sm">Loading verification page...</p>
        </div>
      </div>
    )
  }

  if (showError && !userId) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-800">Verification Required</h2>
                  <p className="text-gray-600 text-sm">
                    {error || "Unable to find verification data. Please try logging in again."}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button onClick={handleRetry} variant="outline" className="w-full">
                    <Timer className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                  <Button onClick={() => router.push("/login")} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-6 pb-6">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              {preferredContactMethod === 'email' ? (
                <Mail className="h-8 w-8 text-emerald-600" />
              ) : (
                <Smartphone className="h-8 w-8 text-emerald-600" />
              )}
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-emerald-800">
                Verify Your Account
              </CardTitle>
              <p className="text-emerald-600 text-sm">
                Enter the 6-digit code sent to {maskEmail(email)}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Verification Error</AlertTitle>
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {!error && countdown > 45 && (
              <Alert className="border-emerald-200 bg-emerald-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <AlertTitle className="text-emerald-800">Code Sent!</AlertTitle>
                <AlertDescription className="text-emerald-700 text-sm">
                  We ve sent a verification code to your {preferredContactMethod}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  onComplete={handleOTPComplete}
                  disabled={isVerifying}
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                    <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                    <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                  </InputOTPGroup>
                  <InputOTPSeparator className="w-4" />
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                    <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                    <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didnt receive the code?
                </p>
                <Button
                  variant="ghost"
                  onClick={handleResendOTP}
                  disabled={isResending || countdown > 0}
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-0 h-auto"
                >
                  {isResending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Sending...
                    </span>
                  ) : countdown > 0 ? (
                    <span className="flex items-center gap-2">
                      <Timer className="h-3 w-3" />
                      Resend in {formatCountdown(countdown)}
                    </span>
                  ) : (
                    "Resend Code"
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={() => handleSubmit()}
                disabled={isVerifying || otp.length !== 6}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Account"
                )}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Having trouble? Contact our support team
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
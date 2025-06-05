/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/app/(auth)/verify-otp/page.tsx */
"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, Mail, MessageSquare, Shield, CheckCircle2, Sparkles, Timer } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ContactMethod } from "@/types/types"

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const OTPInput = ({ value, onChange, disabled }: OTPInputProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, inputValue: string) => {
    const numericValue = inputValue.replace(/\D/g, "")
    if (numericValue.length > 1) return

    const newValue = value.split("")
    newValue[index] = numericValue
    onChange(newValue.join(""))

    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    onChange(pastedData)
    const focusIndex = Math.min(pastedData.length, 5)
    inputRefs.current[focusIndex]?.focus()
  }

  return (
    <div className="flex gap-2 sm:gap-3 justify-center px-2">
      {Array.from({ length: 6 }, (_, index) => (
        <Input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold 
                     border-2 border-slate-200 dark:border-slate-700
                     bg-white dark:bg-slate-800
                     text-slate-900 dark:text-slate-100
                     focus:border-green-500 dark:focus:border-green-400 
                     focus:ring-2 focus:ring-green-500/20 dark:focus:ring-green-400/20
                     hover:border-green-300 dark:hover:border-green-500
                     rounded-xl transition-all duration-200 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-sm hover:shadow-md focus:shadow-lg"
        />
      ))}
    </div>
  )
}

export default function VerifyOTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verificationState, verifyOTP, resendOTP } = useAuth()

  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [preferredContactMethod, setPreferredContactMethod] = useState<ContactMethod>(ContactMethod.EMAIL)
  const initializationRef = useRef(false)

  // 1) Initialize userId & email (URL → in-memory state → sessionStorage)
  useEffect(() => {
    if (initializationRef.current) return
    initializationRef.current = true

    const initializeData = () => {
      let userIdToUse = searchParams.get("userId")
      let emailToUse: string | null = null
      let contactMethod: ContactMethod = ContactMethod.EMAIL

      // A) Try URL parameters first
      const urlUserId = searchParams.get("userId")
      const urlEmail = searchParams.get("email")
      const urlMethod = searchParams.get("method") as ContactMethod
      if (urlUserId && urlEmail) {
        userIdToUse = urlUserId
        emailToUse = urlEmail
        if (urlMethod) contactMethod = urlMethod
      }

      // B) Fallback to in-memory verificationState from AuthProvider
      if ((!userIdToUse || !emailToUse) && verificationState) {
        userIdToUse = verificationState.user_id
        emailToUse = verificationState.email
        contactMethod = verificationState.method
      }

      // C) Fallback to sessionStorage "verificationState" object if present
      if ((!userIdToUse || !emailToUse) && typeof window !== "undefined") {
        const stored = sessionStorage.getItem("verificationState")
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            userIdToUse = parsed.user_id
            emailToUse = parsed.email
            if (parsed.method) contactMethod = parsed.method
          } catch {
            /* ignore parse errors */
          }
        }
      }

      // D) Final fallback to older "verificationUserId" & "verificationEmail" keys
      if (!userIdToUse && typeof window !== "undefined") {
        userIdToUse = sessionStorage.getItem("verificationUserId")
      }
      if (!emailToUse && typeof window !== "undefined") {
        emailToUse = sessionStorage.getItem("verificationEmail")
      }

      // If still missing, show an error
      if (!userIdToUse || !emailToUse) {
        setError("Verification data not found. Please register again.")
        toast.error("Verification data missing", {
          description: "Please register again to receive a verification code",
          action: {
            label: "Register",
            onClick: () => router.push("/auth/register"),
          },
        })
        setIsInitializing(false)
        return
      }

      setUserId(userIdToUse)
      setEmail(emailToUse)
      setPreferredContactMethod(contactMethod)
      setCountdown(60)

      toast.info("Verification code sent", {
        description: `Please check your ${contactMethod === ContactMethod.EMAIL ? "email" : "phone"} for the 6-digit code`,
        duration: 5000,
      })
      setIsInitializing(false)
    }

    initializeData()
  }, [verificationState, searchParams, router])

  // 2) Countdown timer for "Resend"
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // 3) On "Verify" button click
  const handleSubmit = async () => {
    if (!userId || otp.length !== 6) {
      setError("Please enter a complete 6-digit verification code")
      toast.error("Invalid code", {
        description: "Please enter all 6 digits of your verification code",
      })
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      // Send exactly { userId, otpCode, purpose } — matches validateOtpVerification middleware
      await verifyOTP({
        userId,
        otpCode: otp,
        purpose: "registration",
      })

      // Clear any stored verification data
      sessionStorage.removeItem("verificationState")
      sessionStorage.removeItem("verificationUserId")
      sessionStorage.removeItem("verificationEmail")

      // Show success message
      toast.success("Account verified successfully!", {
        description: "Redirecting to document upload...",
        duration: 3000,
      })

      // Immediately redirect to KYC‐upload
      router.push("/auth/auth-code/kyc-documents")
      return
    } catch (err: any) {
      // If backend returns "invalid input syntax for UUID" it means userId was undefined
      console.error("OTP verification failed:", err)
      setError(err.message || "Invalid or expired code. Please try again")
      setOtp("") // clear the 6-digit fields
      toast.error("Verification failed", {
        description: err.message || "Please check your code and try again",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  // 4) On "Resend verification code" button click
  const handleResendOTP = async () => {
    if (!userId) {
      toast.error("Error", {
        description: "User ID not found. Please register again.",
      })
      return
    }

    setIsResending(true)
    setError(null)

    try {
      await resendOTP(userId, preferredContactMethod)
      setCountdown(60)
      setOtp("")
      toast.success("New code sent!", {
        description: `Check your ${preferredContactMethod === ContactMethod.EMAIL ? "email" : "phone"} for the new verification code`,
        duration: 4000,
      })
    } catch (err: any) {
      console.error("Resend OTP failed:", err)
      setError(err.message || "Failed to resend verification code")
      toast.error("Failed to resend", {
        description: err.message || "Please try again in a moment",
      })
    } finally {
      setIsResending(false)
    }
  }

  // 5) "Back" button: clear everything and return to register
  const handleBack = () => {
    sessionStorage.removeItem("verificationState")
    sessionStorage.removeItem("verificationUserId")
    sessionStorage.removeItem("verificationEmail")
    router.push("/auth/register")
  }

  // 6) Format countdown as "MM:SS" or "XXs"
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}s`
  }

  // 7) While we're still figuring out userId/email:
  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="text-center space-y-8 max-w-sm mx-auto">
          <div className="relative">
            <div className="h-20 w-20 mx-auto relative">
              <div className="absolute inset-0 rounded-full border-4 border-green-500/20 dark:border-green-400/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500 dark:border-t-green-400 animate-spin"></div>
              <div className="absolute inset-2 rounded-full bg-green-500/10 dark:bg-green-400/10 animate-pulse flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Preparing Verification
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Setting up your verification process.<br />
              This will only take a moment...
            </p>
          </div>
        </div>
      </div>
    )
  }

  const displayDestination = preferredContactMethod === ContactMethod.EMAIL ? email : "your phone"

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      <Card className="shadow-2xl border border-slate-200 dark:border-slate-700 
                       bg-white dark:bg-slate-900 
                       backdrop-blur-sm overflow-hidden rounded-2xl">
        
        {/* Header Section */}
        <CardHeader className="text-center space-y-6 pb-8 pt-8 px-6 sm:px-8
                             bg-gradient-to-b from-slate-50 to-white 
                             dark:from-slate-800 dark:to-slate-900">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 
                          dark:from-green-900/30 dark:to-green-800/30
                          rounded-2xl flex items-center justify-center shadow-lg
                          ring-4 ring-green-500/10 dark:ring-green-400/10">
            {preferredContactMethod === ContactMethod.EMAIL ? (
              <Mail className="h-10 w-10 text-green-600 dark:text-green-400" />
            ) : (
              <MessageSquare className="h-10 w-10 text-green-600 dark:text-green-400" />
            )}
          </div>
          
          <div className="space-y-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Verify Your Account
            </CardTitle>
            <div className="space-y-2 bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                We&apos;ve sent a 6-digit code to
              </p>
              <p className="text-slate-900 dark:text-slate-100 font-semibold text-sm break-all">
                {displayDestination}
              </p>
              <div className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 
                              text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                {preferredContactMethod === ContactMethod.EMAIL ? (
                  <>
                    <Mail className="h-3 w-3" />
                    Email
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-3 w-3" />
                    SMS
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pt-8 px-6 sm:px-8 pb-8">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="border-red-200 dark:border-red-800 
                                                   bg-red-50 dark:bg-red-950/50 
                                                   backdrop-blur-sm rounded-xl">
              <Shield className="h-4 w-4" />
              <AlertTitle className="text-sm font-semibold">Verification Error</AlertTitle>
              <AlertDescription className="text-sm mt-1">{error}</AlertDescription>
            </Alert>
          )}

          {/* OTP Input Section */}
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 text-center">
                Enter verification code
              </label>
              <OTPInput value={otp} onChange={setOtp} disabled={isVerifying} />
              <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                Enter the 6-digit code sent to your {preferredContactMethod === ContactMethod.EMAIL ? "email" : "phone"}
              </p>
            </div>

            {/* Resend Section */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Timer className="h-4 w-4" />
                <span>Didn&apos;t receive the code?</span>
              </div>
              <Button
                variant="ghost"
                onClick={handleResendOTP}
                disabled={isResending || countdown > 0}
                className="w-full text-green-600 dark:text-green-400 
                           hover:text-green-700 dark:hover:text-green-300
                           hover:bg-green-50 dark:hover:bg-green-900/20 
                           font-semibold transition-all duration-200
                           disabled:opacity-50"
              >
                {isResending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending new code...
                  </span>
                ) : countdown > 0 ? (
                  <span className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    <span>Resend in {formatCountdown(countdown)}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Resend verification code
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1 border-slate-300 dark:border-slate-600
                         text-slate-700 dark:text-slate-300 
                         hover:bg-slate-50 dark:hover:bg-slate-800 
                         hover:border-slate-400 dark:hover:border-slate-500
                         transition-all duration-200 rounded-xl font-semibold"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isVerifying || otp.length !== 6}
              className="flex-1 bg-green-600 hover:bg-green-700 
                         dark:bg-green-600 dark:hover:bg-green-500
                         text-white shadow-lg hover:shadow-xl 
                         transition-all duration-200 disabled:opacity-50 
                         disabled:cursor-not-allowed rounded-xl font-semibold
                         ring-2 ring-green-500/20 dark:ring-green-400/20"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Verify Account
                </>
              )}
            </Button>
          </div>

          {/* Help Section */}
          <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Need help?{" "}
              <button
                className="text-green-600 dark:text-green-400 
                           hover:text-green-700 dark:hover:text-green-300 
                           font-semibold transition-colors duration-200"
                onClick={() => toast.info("Contact support at support@example.com")}
              >
                Contact Support
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
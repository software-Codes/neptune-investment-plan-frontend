/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, Mail, MessageSquare, Shield, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ContactMethod } from "@/types/types"

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const OTPInput = ({ value, onChange, disabled }: OTPInputProps) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, inputValue: string) => {
    // Only allow digits
    const numericValue = inputValue.replace(/\D/g, '');
    if (numericValue.length > 1) return;

    const newValue = value.split('');
    newValue[index] = numericValue;
    const updatedValue = newValue.join('');

    onChange(updatedValue);

    // Auto-focus next input
    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pastedData);

    // Focus the last filled input or the next empty one
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }, (_, index) => (
        <Input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-12 h-12 text-black text-center text-xl font-bold border-2 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg transition-all duration-200 hover:border-emerald-300"
        />
      ))}
    </div>
  );
};

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


  useEffect(() => {
    if (initializationRef.current) return
    initializationRef.current = true

    const initializeData = async () => {
      try {
        let userIdToUse = null
        let emailToUse = null
        let contactMethod: ContactMethod = ContactMethod.EMAIL

        // Priority 1: Check URL parameters (from registration redirect)
        userIdToUse = searchParams.get("userId")
        emailToUse = searchParams.get("email")
        const urlContactMethod = searchParams.get("method") as ContactMethod
        if (urlContactMethod) contactMethod = urlContactMethod

        // Priority 2: Check verification state from AuthProvider
        if (!userIdToUse && verificationState) {
          userIdToUse = verificationState.user_id
          emailToUse = verificationState.email
          contactMethod = verificationState.method
        }


        // Priority 3: Check session storage (fallback)
        if (!userIdToUse) {
          const storedVerificationState = sessionStorage.getItem("verificationState")
          if (storedVerificationState) {
            try {
              const parsedState = JSON.parse(storedVerificationState)
              userIdToUse = parsedState.user_id
              emailToUse = parsedState.email
              contactMethod = parsedState.method || ContactMethod.EMAIL // Fixed this line
            } catch (e) {
              console.error("Error parsing stored verification state:", e)
            }
          }
        }

        // Validate required data
        if (!userIdToUse || !emailToUse) {
          setError("Verification data not found. Please try registering again.")
          toast.error("Verification data missing", {
            description: "Please register again to receive a verification code",
            action: {
              label: "Register",
              onClick: () => router.push("/auth/register")
            }
          })
          setIsInitializing(false)
          return
        }

        setUserId(userIdToUse)
        setEmail(emailToUse)
        setPreferredContactMethod(contactMethod)
        setCountdown(60)

        toast.info("Verification code sent", {
          description: `Please check your ${contactMethod === ContactMethod.EMAIL ? 'email' : 'phone'} for the 6-digit code`,
          duration: 5000
        })

      } catch (error) {
        console.error("Error initializing OTP verification:", error)
        setError("An error occurred while loading verification data")
      } finally {
        setIsInitializing(false)
      }
    }

    initializeData()
  }, [verificationState, searchParams, router])

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSubmit = async () => {
    if (!userId || otp.length !== 6) {
      setError("Please enter a complete 6-digit verification code")
      toast.error("Invalid code", {
        description: "Please enter all 6 digits of your verification code"
      })
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      await verifyOTP({
        userId,
        otpCode: otp,
        purpose: 'registration'
      })

      // Success is handled in AuthProvider
      // Clear session storage
      sessionStorage.removeItem("verificationState")

    } catch (error: any) {
      console.error("OTP verification failed:", error)
      setError(error.message || "Invalid or expired code. Please try again")

      // Clear the OTP input on error
      setOtp("")

      toast.error("Verification failed", {
        description: error.message || "Please check your code and try again"
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    if (!userId) {
      toast.error("Error", {
        description: "User ID not found. Please try registering again."
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
        description: `Check your ${preferredContactMethod === 'email' ? 'email' : 'phone'} for the new verification code`,
        duration: 4000
      })

    } catch (error: any) {
      console.error("Resend OTP failed:", error)
      setError(error.message || "Failed to resend verification code")

      toast.error("Failed to resend", {
        description: error.message || "Please try again in a moment"
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleBack = () => {
    // Clear verification data when going back
    sessionStorage.removeItem("verificationState")

    router.push("/auth/register")
  }

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`
  }

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
            <div className="absolute inset-0 h-16 w-16 rounded-full bg-emerald-500/20 animate-pulse mx-auto" />
          </div>
          <div className="space-y-2">
            <p className="text-emerald-700 text-lg font-medium">Loading verification page...</p>
            <p className="text-emerald-600 text-sm">Please wait while we prepare your verification</p>
          </div>
        </div>
      </div>
    )
  }

  const displayDestination = preferredContactMethod === ContactMethod.EMAIL ? email : 'your phone'

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
          <CardHeader className="text-center space-y-6 pb-8 bg-gradient-to-b from-emerald-50 to-white">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center shadow-lg">
              {preferredContactMethod === ContactMethod.EMAIL ? (
                <Mail className="h-10 w-10 text-emerald-600" />
              ) : (
                <MessageSquare className="h-10 w-10 text-emerald-600" />
              )}
            </div>
            <div className="space-y-3">
              <CardTitle className="text-2xl font-bold text-emerald-800">
                Verify Your Account
              </CardTitle>
              <div className="space-y-1">
                <p className="text-emerald-600 text-sm">
                  We've sent a 6-digit code to
                </p>
                <p className="text-emerald-800 font-medium text-sm">
                  {displayDestination}
                </p>
                <p className="text-emerald-500 text-xs">
                  via {preferredContactMethod === ContactMethod.EMAIL ? 'email' : 'SMS'}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pt-8">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50/80 backdrop-blur-sm">
                <Shield className="h-4 w-4" />
                <AlertTitle className="text-sm font-medium">Verification Error</AlertTitle>
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-emerald-700 text-center">
                  Enter verification code
                </label>
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  disabled={isVerifying}
                />
              </div>

              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?
                </p>
                <Button
                  variant="ghost"
                  onClick={handleResendOTP}
                  disabled={isResending || countdown > 0}
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-medium"
                >
                  {isResending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending new code...
                    </span>
                  ) : countdown > 0 ? (
                    <span className="flex items-center gap-2">
                      <span className="text-emerald-500">Resend in {formatCountdown(countdown)}</span>
                    </span>
                  ) : (
                    "Resend verification code"
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isVerifying || otp.length !== 6}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

            <div className="text-center pt-4 border-t border-emerald-100">
              <p className="text-xs text-gray-500">
                Need help? {" "}
                <button
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                  onClick={() => toast.info("Contact support at support@example.com")}
                >
                  Contact Support
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
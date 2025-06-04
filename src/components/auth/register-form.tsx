/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
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
import { useAuth } from "@/hooks/useAuth"
import { authApi } from "@/lib/api/api-client"
import { ContactMethod, RegistrationData } from "@/types/types"
import { Alert, AlertDescription } from "../ui/alert"
import { AlertCircle, Eye, EyeOff, User, Mail, Phone, Lock, MessageSquare } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

const phoneRegex = /^\+?[1-9]\d{7,14}$/

const registerFormSchema = z.object({
  fullName: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s\-'\.]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
    .refine((name) => name.trim().split(' ').length >= 2, "Please enter your first and last name"),

  email: z.string()
    .email("Please enter a valid email address")
    .max(100, "Email cannot exceed 100 characters")
    .toLowerCase(),

  phoneNumber: z.string()
    .regex(phoneRegex, "Please enter a valid phone number (e.g., +1234567890)")
    .min(8, "Phone number is too short")
    .max(18, "Phone number is too long"),

  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),

  contactMethod: z.enum(["email", "phone"], {
    required_error: "Please select a contact method",
  })
})

type RegisterFormValues = z.infer<typeof registerFormSchema>

export function RegisterForm() {
  const { register, setVerificationState } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      contactMethod: "email"
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    setError(null)
    const loadingToast = toast.loading("Creating your account...")

    try {
      const registrationData: RegistrationData = {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        preferredContactMethod: data.contactMethod as ContactMethod
      }

      const response = await authApi.register(registrationData)

      if (response.success) {
        // Create verification state object
        const verificationState = {
          user_id: response.user.user_id,
          email: response.user.email,
          method: (data.contactMethod === 'phone' ? 'phone' : 'email') as ContactMethod,
          destination: data.contactMethod === 'phone' ? response.user.phone_number : response.user.email,
          attempts: 0,
          lastAttempt: new Date(),
          returnUrl: `/(user)/${response.user.user_id}/dashboard`
        }

        // Store verification data in session storage
        sessionStorage.setItem('verificationState', JSON.stringify(verificationState))

        // Update AuthProvider state
        if (setVerificationState) {
          setVerificationState(verificationState)
        }

        toast.dismiss(loadingToast)
        toast.success("Registration successful!", {
          description: response.message || "Please check your email/phone for verification code",
          duration: 5000,
          action: {
            label: "Verify Now",
            onClick: () => router.push('/auth/otp-verify')
          }
        })

        // Navigate to OTP verification with query parameters as backup
        router.push(`/auth/otp-verify?userId=${response.user.user_id}&email=${encodeURIComponent(response.user.email)}&method=${data.contactMethod}`)
      } else {
        throw new Error(response.message || "Registration failed")
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      const errorMessage = error.response?.data?.message || error.message
      setError(errorMessage)

      toast.dismiss(loadingToast)
      toast.error("Registration Failed", {
        description: errorMessage,
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

    return {
      score,
      strength: score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong'
    }
  }

  const watchedPassword = form.watch("password")
  const passwordStrength = watchedPassword ? getPasswordStrength(watchedPassword) : null

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 flex items-center gap-2 font-medium">
                  <User className="w-4 h-4" />
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="John Doe"
                    className="h-12 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-600 dark:text-red-400" />
              </FormItem>
            )}
          />

          {/* Email */}
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
                    className="h-12 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-600 dark:text-red-400" />
              </FormItem>
            )}
          />

          {/* Phone Number */}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 flex items-center gap-2 font-medium">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    placeholder="+1234567890"
                    className="h-12 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="text-sm text-red-600 dark:text-red-400" />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 flex items-center gap-2 font-medium">
                  <Lock className="w-4 h-4" />
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
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

                {/* Password Strength */}
                {passwordStrength && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-2 flex-1 rounded-full transition-all duration-300 ${level <= passwordStrength.score
                              ? passwordStrength.strength === 'strong'
                                ? 'bg-emerald-500'
                                : passwordStrength.strength === 'medium'
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${passwordStrength.strength === 'strong'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : passwordStrength.strength === 'medium'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                        {passwordStrength.strength === 'strong' && '🔒 Strong password'}
                        {passwordStrength.strength === 'medium' && '⚠️ Medium strength'}
                        {passwordStrength.strength === 'weak' && '❌ Weak password'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {passwordStrength.score}/5
                      </span>
                    </div>
                  </div>
                )}

                <FormMessage className="text-sm text-red-600 dark:text-red-400" />
              </FormItem>
            )}
          />

          {/* Contact Method */}
          <FormField
            control={form.control}
            name="contactMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 flex items-center gap-2 font-medium">
                  <MessageSquare className="w-4 h-4" />
                  Verification Method
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-800 text-slate-900 dark:text-white">
                      <SelectValue placeholder="Choose verification method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectItem value="email" className="text-slate-900 dark:text-white focus:bg-slate-100 dark:focus:bg-slate-700">
                      📧 Email verification
                    </SelectItem>
                    <SelectItem value="phone" className="text-slate-900 dark:text-white focus:bg-slate-100 dark:focus:bg-slate-700">
                      📱 SMS verification
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                <span>Creating Account...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>Create Account</span>
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
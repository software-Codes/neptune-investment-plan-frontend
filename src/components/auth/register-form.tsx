/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Icons } from "@/components/ui/icons"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye, EyeOff } from "lucide-react"
import { RegistrationData } from "@/types/type"
import { authApi } from "@/lib/api/api-client"

// Phone number regex for international format
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

// Comprehensive registration form schema
const registerFormSchema = z.object({
  fullName: z.string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name is too long" })
    .regex(/^[a-zA-Z\s]+$/, { message: "Name can only contain letters and spaces" }),
  
  email: z.string()
    .email({ message: "Please enter a valid email address" })
    .max(100, { message: "Email is too long" }),
  
  phoneNumber: z.string()
    .regex(phoneRegex, {
      message: "Please enter a valid international phone number (e.g. +1234567890)"
    }),
  
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least one special character" }),
  

  
  preferredContactMethod: z.enum(["email", "phone"], {
    required_error: "Please select a contact method",
  })
})

type RegisterFormValues = z.infer<typeof registerFormSchema>

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)


  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
     
      preferredContactMethod: "email"
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    try {
      // Prepare registration data
      const registrationData: RegistrationData = {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        preferredContactMethod: data.preferredContactMethod
      }

      // Attempt registration
      const response = await authApi.register(registrationData)

      // Show success toast
      toast.success("Registration Successful", {
        description: response.message,
        duration: 5000
      })

      // Redirect to verification page
      router.push('/auth/otp-verify')
    } catch (error: any) {
      // Handle registration errors
      const errorMessage = error.message || "Registration failed"
      
      toast.error("Registration Error", {
        description: errorMessage,
        duration: 5000
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Full Name Field */}
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-emerald-800 font-medium">Full Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter your full name"
                  className="h-12 border-emerald-200 bg-emerald-50/50 text-emerald-900"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-emerald-800 font-medium">Email Address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="you@example.com"
                  className="h-12 border-emerald-200 bg-emerald-50/50 text-emerald-900"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />

        {/* Phone Number Field */}
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-emerald-800 font-medium">Phone Number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="tel"
                  placeholder="+1234567890"
                  className="h-12 border-emerald-200 bg-emerald-50/50 text-emerald-900"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-emerald-800 font-medium">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className="h-12 border-emerald-200 bg-emerald-50/50 text-emerald-900 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />


        {/* Preferred Contact Method */}
        <FormField
          control={form.control}
          name="preferredContactMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-emerald-800 font-medium">Preferred Contact Method</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger className="h-12 border-emerald-200 bg-emerald-50/50 text-emerald-900">
                    <SelectValue placeholder="Select contact method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </Form>
  )
}
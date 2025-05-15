/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/hooks/useAuth"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Eye, EyeOff, AlertCircle, Info } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RegistrationData } from "@/types/type"

const phoneRegex = /^\+?[1-9]\d{1,14}$/;

const registerFormSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name is too long" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phoneNumber: z.string().regex(phoneRegex, {
    message: "Please enter a valid phone number (e.g. +1234567890)",
  }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  preferredContactMethod: z.enum(["email", "phone"], {
    required_error: "Please select a contact method",
  }),
})

type RegisterFormValues = z.infer<typeof registerFormSchema>
interface RegisterFormProps extends Omit<React.ComponentPropsWithoutRef<"div">, "onSubmit"> {
    onSubmit?: (data: RegistrationData) => Promise<void>
}

export function RegisterForm({ className, onSubmit, ...props }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const { register } = useAuth()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      preferredContactMethod: "email",
    },
    mode: "onBlur" // Validate fields when they lose focus
  })

  async function handleSubmit(data: RegisterFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      if (onSubmit) {
        await onSubmit(data)
      } else {
        await register(data)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 max-w-md w-full mx-auto p-8 rounded-xl shadow-lg bg-white/90 backdrop-blur-sm border border-emerald-100">
      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
          <div className="flex justify-between items-start">
            <div className="flex gap-2">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
              <AlertDescription>{error}</AlertDescription>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0">
              <X size={16} />
            </button>
          </div>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-emerald-800 font-medium">Full Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isLoading}
                    placeholder="John Doe"
                    className="border-emerald-200 bg-emerald-50/50 text-emerald-900 placeholder:text-emerald-400 focus:border-emerald-500 focus:ring-emerald-500 py-6"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

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
                    placeholder="your.email@example.com"
                    disabled={isLoading}
                    className="border-emerald-200 bg-emerald-50/50 text-emerald-900 placeholder:text-emerald-400 focus:border-emerald-500 focus:ring-emerald-500 py-6"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

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
                    disabled={isLoading}
                    className="border-emerald-200 bg-emerald-50/50 text-emerald-900 placeholder:text-emerald-400 focus:border-emerald-500 focus:ring-emerald-500 py-6"
                  />
                </FormControl>
                <div className="text-xs text-emerald-600/70 mt-1">
                  <div className="flex items-center gap-1">
                    <Info size={12} />
                    <span>Include country code (e.g., +1 for US)</span>
                  </div>
                </div>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

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
                      disabled={isLoading}
                      className="border-emerald-200 bg-emerald-50/50 text-emerald-900 focus:border-emerald-500 focus:ring-emerald-500 py-6 pr-10"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormControl>
                <div className="text-xs flex text-emerald-600/70 mt-1 space-y-1">
                  <p>Password must:</p>
                  <ul className="pl-4 space-y-0 grid grid-cols-2" >
                    <li className={`flex items-center gap-1 ${field.value.length >= 8 ? 'text-emerald-600' : 'text-emerald-400'}`}>
                      <span className="w-1 h-1 bg-current rounded-full"></span>
                      <span>Be at least 8 characters</span>
                    </li>
                    <li className={`flex items-center gap-1 ${/[A-Z]/.test(field.value) ? 'text-emerald-600' : 'text-emerald-400'}`}>
                      <span className="w-1 h-1 bg-current rounded-full"></span>
                      <span>Include an uppercase letter</span>
                    </li>
                    <li className={`flex items-center gap-1 ${/[a-z]/.test(field.value) ? 'text-emerald-600' : 'text-emerald-400'}`}>
                      <span className="w-1 h-1 bg-current rounded-full"></span>
                      <span>Include a lowercase letter</span>
                    </li>
                    <li className={`flex items-center gap-1 ${/[0-9]/.test(field.value) ? 'text-emerald-600' : 'text-emerald-400'}`}>
                      <span className="w-1 h-1 bg-current rounded-full"></span>
                      <span>Include a number</span>
                    </li>
                  </ul>
                </div>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferredContactMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-emerald-800 font-medium">Preferred Contact Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger className="border-emerald-200 bg-emerald-50/50 text-emerald-900 py-6">
                      <SelectValue placeholder="Select contact method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-emerald-600/70 mt-1">
                  <div className="flex items-center gap-1">
                    <Info size={12} />
                    <span>You will receive verification code via this method</span>
                  </div>
                </div>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 py-6 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isLoading && <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />}
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm text-emerald-600/80">
        Already have an account?{" "}
        <a
          href="/auth/login"
          className="text-emerald-600 font-medium hover:text-emerald-700 underline underline-offset-4"
        >
          Sign in
        </a>
      </div>

      <div className="text-balance text-center text-xs text-emerald-600/60">
        By registering, you agree to our{" "}
        <a href="#" className="text-emerald-600 hover:text-emerald-700 underline underline-offset-4">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-emerald-600 hover:text-emerald-700 underline underline-offset-4">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  )
}
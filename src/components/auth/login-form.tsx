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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X } from "lucide-react"

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
}

export function   LoginForm({ className, onSubmit, ...props }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    
    try {
      if (onSubmit) {
        await onSubmit(data)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6 max-w-md w-full mx-auto p-8 rounded-xl shadow-lg bg-white/90 backdrop-blur-sm border border-emerald-100", className)} {...props}>
      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
          <div className="flex justify-between items-start">
            <AlertDescription>{error}</AlertDescription>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <X size={16} />
            </button>
          </div>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6">
          <div className="grid gap-6">
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
                      className="border-emerald-200 bg-emerald-50/50 text-emerald-900 placeholder:text-emerald-400 focus:border-emerald-500 focus:ring-emerald-500 py-6"
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
                      href="/auth/forgot-password"
                      className="text-sm text-emerald-600 hover:text-emerald-700 underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      disabled={isLoading}
                      className="border-emerald-200 bg-emerald-50/50 text-emerald-900 focus:border-emerald-500 focus:ring-emerald-500 py-6"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 py-6 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isLoading && (
                <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
              )}
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </form>
      </Form>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-emerald-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-sm text-emerald-600/70">or</span>
        </div>
      </div>

      <div className="text-center text-sm text-emerald-600/80">
        Don&apos;t have an account?{" "}
        <a
          href="/auth/register"
          className="text-emerald-600 font-medium hover:text-emerald-700 underline underline-offset-4"
        >
          Sign up
        </a>
      </div>

      <div className="text-balance text-center text-xs text-emerald-600/60">
        By clicking continue, you agree to our{" "}
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
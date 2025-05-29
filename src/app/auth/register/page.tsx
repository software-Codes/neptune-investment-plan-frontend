"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RegisterForm } from "@/components/auth/register-form"
import { ArrowLeft, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => router.push('/auth/login')}
          className="hover:bg-emerald-100/50 text-emerald-700 hover:text-emerald-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
          <div className="w-full max-w-lg">
            {/* Logo/Brand Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-emerald-900 mb-2">
                Join Neptune Investment
              </h1>
              <p className="text-emerald-700/80 text-lg">
                Start building your financial future today
              </p>
            </div>

            {/* Registration Card */}
            <Card className="bg-white/95 backdrop-blur-sm border-emerald-100/50 shadow-xl">
              <CardHeader className="space-y-2 pb-6">
                <CardTitle className="text-2xl font-semibold text-emerald-900 text-center">
                  Create Your Account
                </CardTitle>
                <CardDescription className="text-emerald-700/80 text-center">
                  Get started with your investment journey in minutes
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <RegisterForm />
                
                {/* Login Link */}
                <div className="mt-8 text-center">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-emerald-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 text-emerald-600">Already have an account?</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="link"
                    onClick={() => router.push('/auth/login')}
                    className="font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    Sign in to your account
                  </Button>
                </div>

                {/* Terms and Privacy */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-emerald-700/70">
                    By creating an account, you agree to our{' '}
                    <Link href="/terms" className="underline hover:text-emerald-600">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="underline hover:text-emerald-600">
                      Privacy Policy
                    </Link>
                  </p>
                </div>

                {/* Security Notice */}
                <div className="mt-6 flex items-center justify-center gap-2 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs text-emerald-700">
                    Your data is protected with bank-level encryption
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white/60 rounded-lg border border-emerald-100">
                <div className="text-lg font-bold text-emerald-900">$50M+</div>
                <div className="text-xs text-emerald-700/70">Assets Managed</div>
              </div>
              <div className="p-4 bg-white/60 rounded-lg border border-emerald-100">
                <div className="text-lg font-bold text-emerald-900">25K+</div>
                <div className="text-xs text-emerald-700/70">Investors</div>
              </div>
              <div className="p-4 bg-white/60 rounded-lg border border-emerald-100">
                <div className="text-lg font-bold text-emerald-900">15%</div>
                <div className="text-xs text-emerald-700/70">Avg. Returns</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
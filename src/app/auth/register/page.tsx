"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RegisterForm } from "@/components/auth/register-form"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col  bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-12">
      <Card className="w-full bg-white/90 backdrop-blur-sm border-emerald-100 rounded-xl  border max-w-md shadow-xl border-emerald-100/50">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => router.push('/pages/auth/login')}
              className="hover:bg-emerald-100/50"
            >
              <ArrowLeft className="h-5 w-5 text-emerald-600" />
            </Button>
            <CardTitle className="text-2xl font-bold text-emerald-800">
              Create Your Account
            </CardTitle>
          </div>
          <CardDescription className="text-emerald-600/70">
            Join Neptune Investment Platform and start your financial journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          <div className="">
            <RegisterForm />
          </div>
          
          
          <div className="mt-6 text-center">
            <p className="text-sm text-emerald-600">
              Already have an account?{' '}
              <Button 
                variant="link" 
                onClick={() => router.push('/auth/login')}
                className="text-emerald-700 hover:text-emerald-900"
              >
                Sign in
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

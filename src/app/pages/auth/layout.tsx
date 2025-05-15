"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { NeptuneLogo } from "@/assets/images/Images"

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50 to-teal-50">
      {/* Logo at the top left */}
      <div className="p-4 sm:p-6">
        <Link href="/" className="inline-block">
          <Image
            src={NeptuneLogo}
            alt="Neptune Logo" 
            className="h-12 w-auto rounded-full shadow-sm"
          />
        </Link>
      </div>

      {/* Auth Content */}
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full sm:w-[500px] rounded-2xl bg-white p-6 sm:p-8 shadow-xl">
          {children}
        </div>
      </div>
    </div>
  )
}

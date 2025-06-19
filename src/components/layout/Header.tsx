// src/components/Header.tsx
"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Sun, Moon, LogOut, User, Settings, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import UserAvatar from '@/lib/avatar'
import { NeptuneLogo } from '@/assets/images/Images'
import { useAuth } from '@/hooks/useAuth'

interface NavigationItem {
  name: string
  href: string
}

/**
 * Header component: shows logo, navigation, theme toggle, and user menu.
 * Uses useAuth() to get current user and display their name and ID.
 */
export const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Derive userId and fullName directly from context
  const userId = user?.user_id
  const fullName = user?.full_name || 'User'

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: `/${userId}/dashboard` },
    { name: 'Invest', href: `/${userId}/investments` },
    { name: 'Deposits', href: `/${userId}/deposits` },
    { name: 'Withdrawals', href: `/${userId}/withdrawals` },
    { name: 'Referrals', href: `/${userId}/referral` },
    { name: 'Transactions', href: `/${userId}/transactions` },
  ]

  const isDark = theme === 'dark'
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark')

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  const isActive = (href: string) => pathname === href

  return (
    <header className={`sticky top-0 z-50 backdrop-blur bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-700`}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link href={userId ? `/${userId}/dashboard` : '/'} className="flex items-center space-x-2">
          <div className="relative h-8 w-8">
            <Image src={NeptuneLogo} alt="Logo" fill className="object-contain rounded-full" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-yellow-400 bg-clip-text text-transparent">
            Neptune
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex space-x-2">
          {navigation.map(item => (
            <Link key={item.name} href={item.href}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive(item.href)
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800'
              }`}>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Theme toggle */}
          <Button onClick={toggleTheme} variant="ghost" className="p-0 h-9 w-9">
            {isDark ? (
              <Moon className="h-4 w-4 text-gray-400" />
            ) : (
              <Sun className="h-4 w-4 text-gray-600" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 h-9 w-9">
                {user ? <UserAvatar fullName={fullName} sizePx={32} /> : <User className="h-6 w-6 text-gray-600" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" forceMount>
              {user && (
                <div className="px-3 py-2">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{fullName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">ID: {userId}</p>
                </div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={userId ? `/${userId}/profile` : '/'} className="flex items-center">
                  <User className="mr-2 h-4 w-4" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={userId ? `/${userId}/settings` : '/'} className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/support" className="flex items-center">
                  <HelpCircle className="mr-2 h-4 w-4" /> Support
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu button */}
          <Button onClick={() => setMobileOpen(!mobileOpen)} variant="ghost" className="lg:hidden p-0 h-9 w-9">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="lg:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
          {navigation.map(item => (
            <Link key={item.name} href={item.href} onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2 text-sm font-medium ${
                isActive(item.href) ? 'bg-green-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}>
              {item.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}

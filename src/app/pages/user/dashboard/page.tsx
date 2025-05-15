/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authApi } from "@/lib/api-client"
import { Home } from 'lucide-react'

const DashboardPage = () => {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [userDetails, setUserDetails] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(true)

  // Fetch user details when component mounts
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const details = await authApi.getCurrentUser()
        setUserDetails(details)
      } catch (error: any) {
        toast.error("Failed to load user details", {
          description: error.message
        })
      } finally {
        setLoadingDetails(false)
      }
    }

    if (user) {
      fetchUserDetails()
    }
  }, [user])
const handleHomeRedirect = () => {
  router.push('/?bypass=true');  // Add a bypass parameter
}

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      toast.success("Logged out successfully")
      router.push('/pages/auth/login')
    } catch (error: any) {
      console.error('Logout failed:', error)
      toast.error("Logout failed", {
        description: error.message
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (isLoading || loadingDetails) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto"></div>
            <div className="absolute inset-0 h-12 w-12 rounded-full bg-emerald-500/10 animate-pulse mx-auto"></div>
          </div>
          <p className="text-emerald-700">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
            <Home className=' text-green-500 ' onClick={handleHomeRedirect} />
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
          <div className="space-y-4">
            {/* Profile Header */}
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-semibold text-emerald-600">
                  {userDetails?.user?.fullName?.charAt(0) || '?'}
                </span>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {userDetails?.user?.fullName}
                </h3>
                <p className="text-gray-500">{userDetails?.user?.email}</p>
                <p className="text-sm text-gray-500">
                  {userDetails?.user?.phoneNumber}
                </p>
              </div>
            </div>

            {/* Account Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Account Status</p>
                <p className="font-medium text-gray-900">
                  {userDetails?.user?.accountStatus}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Verification Status</p>
                <div className="space-y-1">
                  <p className="text-sm">
                    Email: {userDetails?.user?.emailVerified ? '✅ Verified' : '⏳ Pending'}
                  </p>
                  <p className="text-sm">
                    Phone: {userDetails?.user?.phoneVerified ? '✅ Verified' : '⏳ Pending'}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Completion Status */}
            {userDetails?.accountCompletion && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-4">Account Completion</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{userDetails.accountCompletion.overallCompletion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-emerald-600 h-2.5 rounded-full" 
                      style={{ width: `${userDetails.accountCompletion.overallCompletion}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authApi } from "@/lib/api-client"
import { 
  Home, 
  Wallet, 
  User, 
  Shield, 
  FileText, 
  Bell,
  CreditCard,
  Settings,
  LogOut
} from 'lucide-react'
import { UserProfile, KYCDocument, Wallet as WalletType } from '@/types/type'

const DashboardPage = () => {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [userDetails, setUserDetails] = useState<UserProfile | null>(null)
  const [documents, setDocuments] = useState<KYCDocument[]>([])
  const [loadingDetails, setLoadingDetails] = useState(true)

  // Fetch user details and documents when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userResponse, documentsResponse] = await Promise.all([
          authApi.getCurrentUser(),
          authApi.getUserDocuments()
        ])
        
        setUserDetails(userResponse)
        setDocuments(documentsResponse)
      } catch (error: any) {
        toast.error("Failed to load user data", {
          description: error.message
        })
      } finally {
        setLoadingDetails(false)
      }
    }

    if (user) {
      fetchUserData()
    }
  }, [user])
  //Add handleLogout function
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast.success('Logged out successfully');
      router.push('/pages/auth/login');
    } catch (error: any) {
      toast.error('Failed to logout', {
        description: error.message
      });
    } finally {
      setIsLoggingOut(false);
    }
  };


  // Loading state with improved UI
  if (isLoading || loadingDetails) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto"></div>
            <div className="absolute inset-0 h-16 w-16 rounded-full bg-emerald-500/10 animate-pulse mx-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-emerald-700">Loading your dashboard</p>
            <p className="text-sm text-emerald-600/70">Please wait while we fetch your information</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-emerald-700">Neptune Investment</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Home className="text-emerald-600 cursor-pointer" onClick={() => router.push('/?bypass=true')} />
          <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut size={18} />
                    <span>Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-semibold text-emerald-600">
                    {userDetails?.full_name?.charAt(0) || '?'}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{userDetails?.full_name}</h2>
                  <p className="text-gray-500">{userDetails?.email}</p>
                  <p className="text-sm text-gray-500">{userDetails?.phone_number}</p>
                </div>
              </div>

              {/* Account Status Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Account Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      userDetails?.account_status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {userDetails?.account_status}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Member Since</span>
                    <span className="text-sm text-gray-900">
                      {userDetails?.created_at.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      userDetails?.email_verified ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {userDetails?.email_verified ? '✓' : '!'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email Verification</p>
                      <p className="text-xs text-gray-500">
                        {userDetails?.email_verified ? 'Verified' : 'Pending verification'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      userDetails?.phone_verified ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {userDetails?.phone_verified ? '✓' : '!'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone Verification</p>
                      <p className="text-xs text-gray-500">
                        {userDetails?.phone_verified ? 'Verified' : 'Pending verification'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wallets Overview */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Wallet className="mr-2 text-emerald-600" size={20} />
              Your Wallets
            </h3>
            <div className="space-y-4">
              {userDetails?.wallets.map((wallet: WalletType) => (
                <div 
                  key={wallet.wallet_id}
                  className="p-4 bg-gray-50 rounded-lg space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{wallet.currency}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      wallet.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {wallet.status}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: wallet.currency
                    }).format(wallet.balance)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* KYC Documents */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="mr-2 text-emerald-600" size={20} />
                KYC Documents
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploaded
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Verified
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents.map((doc) => (
                      <tr key={doc.document_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doc.document_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            doc.verification_status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : doc.verification_status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.verification_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.verified_at 
                            ? new Date(doc.verified_at).toLocaleDateString()
                            : 'Pending'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
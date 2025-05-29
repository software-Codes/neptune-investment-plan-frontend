/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/providers/AuthProvider.tsx
"use client"
import React, { createContext, useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AuthContextType,
  ContactMethod,
  KYCDocument,
  OTPVerificationData,
  RegistrationData,
  User,
  UserProfile,
  VerificationState
} from '@/types/types';
import { apiClient, authApi } from '@/lib/api/api-client';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

const COOKIE_OPTIONS = {
  expires: 7,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [verificationState, setVerificationState] = useState<VerificationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const loginAttempted = useRef(false);

  const setAuthToken = (token: string) => {
    localStorage.setItem('token', token);
    Cookies.set('auth-token', token, COOKIE_OPTIONS);
  };

  const removeAuthToken = () => {
    localStorage.removeItem('token');
    Cookies.remove('auth-token');
  };

  const handleVerificationRedirect = (data: {
    user_id: string;
    email: string;
    method?: ContactMethod;
    returnUrl?: string;
  }) => {
    const newVerificationState: VerificationState = {
      user_id: data.user_id,
      email: data.email,
      method: data.method || ContactMethod.EMAIL,
      destination: data.email,
      attempts: 0,
      returnUrl: data.returnUrl
    };

    setVerificationState(newVerificationState);
    sessionStorage.setItem('verificationState', JSON.stringify(newVerificationState));

    toast.info("Verification required", {
      description: `Please verify your account via ${data.method || 'email'}`,
      action: {
        label: "Verify Now",
        onClick: () => router.push('/auth/otp-verify')
      }
    });

    router.push('/auth/otp-verify');
  };

  const register = async (data: RegistrationData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(data);

      if (response.success && response.user && response.user.user_id) {
        handleVerificationRedirect({
          user_id: response.user.user_id,
          email: response.user.email,
          method: response.user.preferred_contact_method,
          returnUrl: `/(user)/${response.user.user_id}/dashboard`
        });

        toast.success("Registration successful!", {
          description: `Verification code sent via ${response.user.preferred_contact_method}`,
          duration: 5000,
          action: {
            label: "Verify Now",
            onClick: () => router.push('/auth/otp-verify')
          }
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      setError(errorMessage);
      toast.error("Registration failed", {
        description: errorMessage,
        duration: 5000
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

 const login = async (email: string, password: string): Promise<void> => {
    if (loginAttempted.current) return;
    loginAttempted.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(email, password);

      if (!response.success || !response.data?.user) {
        throw new Error("Invalid response from server");
      }

      const userData = response.data.user;

      // 1) Unverified users → OTP flow
      if (!userData.email_verified && !userData.phone_verified) {
        loginAttempted.current = false;
        return handleVerificationRedirect({
          user_id: userData.user_id,
          email: userData.email,
          method: userData.preferred_contact_method,
          // **no (user) group**, just /<userId>/dashboard
          returnUrl: `/${userData.user_id}/dashboard`,
        });
      }

      // 2) Persist token + userId cookie
      setAuthToken(response.data.token);
      Cookies.set("user-id", userData.user_id, COOKIE_OPTIONS);

      // 3) Set user & short-circuit the init effect
      setUser(userData);
      setIsInitialized(true);

      toast.success("Login Successful", {
        description: "Welcome back!",
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });

      // 4) Redirect to either the stored path or to /<userId>/dashboard
      const raw = sessionStorage.getItem("redirectTo");
      const redirectTo = raw ? raw : `/${userData.user_id}/dashboard`;
      sessionStorage.removeItem("redirectTo");

      router.replace(redirectTo);
    } catch (err: any) {
      loginAttempted.current = false;

      // If the API signaled `requiresVerification`, kick into that flow
      if (err.requiresVerification) {
        return handleVerificationRedirect({
          user_id: err.userId,
          email: err.email,
          method: err.preferredContactMethod,
          returnUrl: `/${err.userId}/dashboard`,
        });
      }

      const msg = err.response?.data?.message || err.message;
      setError(msg);
      toast.error("Login Failed", {
        description: msg,
        icon: <XCircle className="h-4 w-4 text-red-500" />,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (data: OTPVerificationData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.verifyOTP(
        data.userId,
        data.otpCode,
        data.purpose
      );

      if (response.success && response.data?.token && response.data?.user) {
        setAuthToken(response.data.token);
        setUser(response.data.user);
        setVerificationState(null);
        sessionStorage.removeItem('verificationState');

        toast.success("Verification Successful", {
          description: "Your account has been verified successfully!",
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
        });

        const returnUrl = verificationState?.returnUrl || `/(user)/${response.data.user.user_id}/dashboard`;
        router.replace(returnUrl);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      setError(errorMessage);
      toast.error("Verification Failed", {
        description: errorMessage,
        icon: <XCircle className="h-4 w-4 text-red-500" />
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async (userId: string, method?: ContactMethod): Promise<void> => {
    try {
      // Check for rate limiting
      const lastAttempt = verificationState?.lastAttempt;
      if (lastAttempt) {
        const timeSinceLastAttempt = Date.now() - new Date(lastAttempt).getTime();
        if (timeSinceLastAttempt < 60000) { // 1 minute cooldown
          toast.error("Please wait", {
            description: "You can request a new code in 1 minute",
            icon: <AlertCircle className="h-4 w-4 text-amber-500" />
          });
          return;
        }
      }

      await authApi.resendOTP(userId, verificationState?.email, method);

      if (verificationState) {
        const updatedState = {
          ...verificationState,
          attempts: (verificationState.attempts || 0) + 1,
          lastAttempt: new Date()
        };
        setVerificationState(updatedState);
        sessionStorage.setItem('verificationState', JSON.stringify(updatedState));
      }

      toast.success("Code Resent", {
        description: "Please check your email/phone for the new code",
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error("Failed to resend code", {
        description: errorMessage,
        icon: <XCircle className="h-4 w-4 text-red-500" />
      });
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      handleLogout();
      router.replace('/auth/login');
      toast.success('Successfully logged out');
    } catch (error: any) {
      console.error('Logout error:', error);
      handleLogout(); // Still clear local state
      toast.error("Logout failed", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logoutAllDevices = async (): Promise<void> => {
    try {
      await authApi.logoutAllDevices();
      handleLogout();
      router.replace('/auth/login');
      toast.success('Logged out from all devices');
    } catch (error: any) {
      toast.error("Failed to logout from all devices", {
        description: error.message
      });
      throw error;
    }
  };

  const getCurrentUser = async (): Promise<UserProfile> => {
    try {
      const userProfile = await authApi.getCurrentUser();
      setUser(userProfile);
      return userProfile;
    } catch (error: any) {
      handleLogout();
      throw error;
    }
  };

  const checkVerificationStatus = async () => {
    try {
      const user = await getCurrentUser();
      return {
        email: user.email_verified,
        phone: user.phone_verified,
        required: !user.email_verified && !user.phone_verified
      };
    } catch (error) {
      return {
        email: false,
        phone: false,
        required: true
      };
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem('userData');
    setUser(null);
    setVerificationState(null);
    sessionStorage.removeItem('verificationState');
    loginAttempted.current = false;
  };

  // Initialize authentication state - IMPROVED
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token') || Cookies.get('auth-token');
        if (!token) {
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }

        const isValid = await authApi.validateToken();
        if (isValid) {
          // await getCurrentUser();
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        handleLogout();
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized]);

  const contextValue: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    register,
    verifyOTP,
    resendOTP,
    logoutAllDevices,
    getCurrentUser,
    checkAuth: authApi.validateToken,
    verificationState,
    setVerificationState,
    handleVerificationRedirect,
    checkVerificationStatus,
    uploadDocument: authApi.uploadDocument,
    getDocumentStatus: authApi.getDocumentStatus,
    getUserDocuments: authApi.getUserDocuments,
    verificationData: null,
    initiatePasswordReset: async (email: string): Promise<void> => {
      await authApi.requestPasswordReset(email);
    },
    completePasswordReset: async (userId: string, otpCode: string, newPassword: string): Promise<void> => {
      await authApi.completePasswordReset(userId, otpCode, newPassword);
    },
  };

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
            <div className="absolute inset-0 h-12 w-12 rounded-full bg-emerald-500/10 animate-pulse mx-auto" />
          </div>
          <p className="text-emerald-700 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {error && (
        <Alert variant="destructive" className="fixed top-4 right-4 w-96 z-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {children}
    </AuthContext.Provider>
  );
}
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/context/AuthProvider.tsx
"use client"

import React, { createContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContextType, RegistrationData, User, VerificationResponse } from '@/types/type';
import { apiClient, authApi } from '@/lib/api-client';
import { toast } from 'sonner';

/**
 * Authentication Context
 * Provides authentication state and methods throughout the application
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

/**
 * AuthProvider Component
 * Manages authentication state and provides authentication methods to child components
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [verificationRedirectData, setVerificationRedirectData] = useState<{ userId?: string; email?: string } | null>(null);
    const router = useRouter();

    /**
     * Registers a new user
     */
    const register = async (data: RegistrationData): Promise<void> => {
        setIsLoading(true);
        try {
            const response = await authApi.register(data);
            
            // Store user ID for verification page if needed
            if (response.data.user && response.data.user.userId) {
                setVerificationRedirectData({
                    userId: response.data.user.userId,
                    email: response.data.user.email
                });
                
                // Show success message with more details
                toast.success("Registration successful!", {
                    description: `Verification code sent via ${data.preferredContactMethod}. Please verify your account.`,
                    duration: 5000
                });
                
                // Redirect to verification page
                router.push('/pages/auth/otp-verify');
            } else {
                toast.success('Registration successful!', {
                    description: 'Please check your email or phone for verification.',
                    duration: 5000
                });
                router.push('/pages/auth/otp-verify');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            
            // Improved error messaging
            const errorMessage = getReadableErrorMessage(error);
            toast.error("Registration failed", {
                description: errorMessage,
                duration: 4000
            });
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Verifies the current authentication status
     */
    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return false;
            }

            const response = await authApi.verify();
            const userData = response;
            
            if (!userData.data.userId) {
                handleLogout();
                return false;
            }
            
            setUser({
                id: userData.data.userId,
                email: userData.data.email,
                name: userData.data.fullName,
                role: userData.data.accountStatus === 'active' ? 'user' : 'pending',
            });

            return true;
        } catch (error) {
            console.error('Auth check failed:', error);
            handleLogout();
            return false;
        }
    };

    /**
     * Handles the logout cleanup
     */
    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    /**
     * Authenticates a user with email and password
     */
 const login = async (email: string, password: string) => {
  setIsLoading(true);
  try {
    const response = await authApi.login(email, password);
    
    // Check if the response contains a token
    if (!response.data.token) {
      throw new Error("Login successful but token not received. Please check your email or phone for verification instructions.");
    }

    localStorage.setItem('token', response.data.token);
    
    // Check if user is verified
    if (!response.data.user.email_verified && !response.data.user.phone_verified) {
      setVerificationRedirectData({
        userId: response.data.user.userId,
        email
      });
      router.push('/pages/auth/otp-verify');
      return;
    }

    const authSuccess = await checkAuth();
    if (authSuccess) {
      toast.success('Successfully logged in');
    } else {
      throw new Error('Failed to retrieve user details');
    }
  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.requiresVerification) {
      setVerificationRedirectData({
        userId: error.userId,
        email
      });
      router.push('/pages/auth/otp-verify');
      return;
    }
    
    const errorMessage = getReadableErrorMessage(error);
    toast.error(errorMessage);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

    /**
     * Logs out the current user
     */
    const logout = async () => {
        setIsLoading(true);
        try {
            await authApi.logout();
            toast.success('Goodbye!', {
                description: 'You have been successfully logged out.',
                duration: 3000
            });
        } catch (error) {
            console.error('Logout error:', error);
            // Even if server logout fails, clear local state
            toast.error("Logout error", {
                description: 'An error occurred during logout, but you have been logged out locally.',
                duration: 3000
            });
        } finally {
            handleLogout();
            router.push('/login');
            setIsLoading(false);
        }
    };
    
    /**
     * Formats error messages to be more user-friendly
     */
    const getReadableErrorMessage = (error: any): string => {
        const message = error.message || 'An unknown error occurred';
        
        // Transform specific server messages
        const errorMappings: Record<string, string> = {
            'User already exists': 'An account with this email already exists. Please sign in instead.',
            'invalid credentials': 'The email or password you entered is incorrect. Please try again.',
            'Invalid email or password': 'The email or password you entered is incorrect. Please try again.',
            'not verified': 'Your account needs verification. Please check your email or phone for the verification code.',
            'Account is not verified': 'Your account needs verification. Please check your email or phone for the verification code.',
            'User not found': 'No account found with this email address. Please check your email or sign up for a new account.'
        };
        
        // Check for specific error patterns
        for (const [pattern, userMessage] of Object.entries(errorMappings)) {
            if (message.toLowerCase().includes(pattern.toLowerCase())) {
                return userMessage;
            }
        }
        
        // Handle network and server errors
        if (message.includes('no internet') || message.includes('connect')) {
            return 'Unable to connect to the server. Please check your internet connection and try again.';
        }
        
        if (message.includes('timeout')) {
            return 'The server is taking too long to respond. Please try again in a moment.';
        }
        
        if (message.includes('500') || message.includes('server error')) {
            return 'The server is experiencing issues. Please try again later.';
        }
        
        return message;
    };

    // Initialize authentication state
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                await checkAuth();
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                setIsLoading(false);
                setIsInitialized(true);
            }
        };

        initializeAuth();
    }, []);

    // Context value with all authentication methods and state
    const contextValue: AuthContextType = {
        user,
        isLoading,
        login,
        logout,
        checkAuth,
        register,
        verificationData: verificationRedirectData
    };

    if (!isInitialized) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
                <div className="text-center space-y-4">
                    <div className="relative">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto"></div>
                        <div className="absolute inset-0 h-12 w-12 rounded-full bg-emerald-500/10 animate-pulse mx-auto"></div>
                    </div>
                    <p className="text-emerald-700 text-lg font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}
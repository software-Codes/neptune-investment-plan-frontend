/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/context/AuthProvider.tsx
"use client"

import React, { createContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContextType, ContactMethod, KYCDocument, OTPVerificationData, RegistrationData, User, UserProfile, VerificationResponse } from '@/types/type';
import { apiClient, authApi } from '@/lib/api/api-client';
import { toast } from 'sonner';
import Cookies from 'js-cookie'; // Add this import

/**
 * Authentication Context
 * Provides authentication state and methods throughout the application
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

// Cookie configuration
const COOKIE_OPTIONS = {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const
};

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
     * Sets authentication token in both localStorage and cookies
     * for compatibility with client-side and middleware checks
     */
    const setAuthToken = (token: string) => {
        // Store in localStorage for client-side use
        localStorage.setItem('token', token);

        // Store in cookies for middleware (server-side) use
        Cookies.set('auth-token', token, COOKIE_OPTIONS);
    };

    /**
     * Removes authentication token from both localStorage and cookies
     */
    const removeAuthToken = () => {
        localStorage.removeItem('token');
        Cookies.remove('auth-token');
    };

    /**
     * Registers a new user
     */
    const register = async (data: RegistrationData): Promise<void> => {
        setIsLoading(true);
        try {
            const response = await authApi.register(data);

            // Store user ID for verification page if needed
            if (response.user && response.user.userId) {
                setVerificationRedirectData({
                    userId: response.user.userId,
                    email: response.user.email
                });

                // Show success message with more details
                toast.success("Registration successful!", {
                    description: `Verification code sent via ${data.preferred_contact_method}. Please verify your account.`,
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
     * Checks if the user is authenticated by verifying token exists and validates it
     */
    const checkAuth = async () => {
        try {
            // First validate the token with the server
            const isValid = await authApi.validateToken();
            if (!isValid) {
                handleLogout();
                return false;
            }

            // If token is valid, fetch current user data
            const userData = await authApi.getCurrentUser();

            if (userData) {
                setUser({
                    userId: userData.userId,
                    email: userData.email,
                    full_name: userData.full_name,
                    phone_number: userData.phone_number,
                    preferred_contact_method: userData.preferred_contact_method,
                    account_status: userData.account_status,
                    email_verified: userData.email_verified,
                    phone_verified: userData.phone_verified,
                    created_at: userData.created_at,
                    updated_at: userData.updated_at,
                    role: userData.account_status === 'active' ? 'user' : 'pending',
                });
                // Store user data in localStorage for persistence
                localStorage.setItem('userData', JSON.stringify(userData));

                return true;
            }

            return false;
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
        removeAuthToken();
        localStorage.removeItem('userData');
        setUser(null);
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await authApi.login(email, password);

            if (response.data.token) {
                // Get user data from the response
                const userData = response.data.user;

                // Check if user needs verification
                if (userData && (!userData.email_verified && !userData.phone_verified)) {
                    const verificationData = {
                        userId: userData.userId,
                        email: userData.email || email
                    };

                    setVerificationRedirectData(verificationData);

                    // Store verification data
                    sessionStorage.setItem("verificationUserId", userData.userId);
                    sessionStorage.setItem("verificationEmail", userData.email || email);
                    sessionStorage.setItem("preferredContactMethod", userData.preferred_contact_method || "email");
                    sessionStorage.setItem("returnUrl", "/dashboard");

                    toast.info("Account verification required");
                    router.push('/pages/auth/otp-verify');
                    return;
                }

                // Set user state with correct data structure
                setUser({
                    userId: userData.userId,
                    email: userData.email,
                    full_name: userData.full_name,
                    phone_number: userData.phone_number,
                    preferred_contact_method: userData.preferred_contact_method,
                    account_status: userData.account_status,
                    email_verified: userData.email_verified,
                    phone_verified: userData.phone_verified,
                    created_at: new Date(userData.created_at),
                    last_login_at: userData.last_login_at ? new Date(userData.last_login_at) : undefined,
                    role: userData.account_status === 'active' ? 'user' : 'pending'
                });

                // Update local storage
                localStorage.setItem('userData', JSON.stringify(userData));

                toast.success('Successfully logged in');

                // Handle redirect
                setTimeout(() => {
                    const redirectTo = sessionStorage.getItem('redirectTo') || '/pages/user/dashboard';
                    sessionStorage.removeItem('redirectTo');
                    router.push(redirectTo);
                }, 100);
            }
        } catch (error: any) {
            console.error('Login error:', error);

            // Handle verification required case
            if (error.requiresVerification && error.userId) {
                setVerificationRedirectData({
                    userId: error.userId,
                    email: email
                });

                sessionStorage.setItem("verificationUserId", error.userId);
                sessionStorage.setItem("verificationEmail", email);
                sessionStorage.setItem("preferredContactMethod", error.preferredContactMethod || "email");
                sessionStorage.setItem("returnUrl", "/dashboard");

                toast.info("Account verification required");
                router.push('/pages/auth/otp-verify');
                return;
            }

            const errorMessage = getReadableErrorMessage(error);
            toast.error("Login failed", {
                description: errorMessage
            });
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
            toast.success('Successfully logged out');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error("Logout failed locally");
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

        // Store redirectTo from URL params if present
        const urlParams = new URLSearchParams(window.location.search);
        const redirectParam = urlParams.get('redirectTo');
        if (redirectParam) {
            sessionStorage.setItem('redirectTo', redirectParam);
        }
    }, []);

    // Context value with all authentication methods and state
    const contextValue: AuthContextType = {
        user,
        isLoading,
        login,
        logout,
        checkAuth,
        register,
        verificationData: verificationRedirectData,
        logoutAllDevices: function (): Promise<void> {
            throw new Error('Function not implemented.');
        },
        verifyOTP: function (data: OTPVerificationData): Promise<void> {
            throw new Error('Function not implemented.');
        },
        resendOTP: function (userId: string, method?: ContactMethod): Promise<void> {
            throw new Error('Function not implemented.');
        },
        initiatePasswordReset: function (email: string): Promise<void> {
            throw new Error('Function not implemented.');
        },
        completePasswordReset: function (userId: string, otpCode: string, newPassword: string): Promise<void> {
            throw new Error('Function not implemented.');
        },
        getCurrentUser: function (): Promise<UserProfile> {
            throw new Error('Function not implemented.');
        },
        uploadDocument: function (file: File, documentType: string, documentCountry: string): Promise<void> {
            throw new Error('Function not implemented.');
        },
        getDocumentStatus: function (documentId: string): Promise<KYCDocument> {
            throw new Error('Function not implemented.');
        },
        getUserDocuments: function (): Promise<KYCDocument[]> {
            throw new Error('Function not implemented.');
        }
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
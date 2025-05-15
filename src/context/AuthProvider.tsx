/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/context/AuthProvider.tsx
"use client"

import React, { createContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContextType, RegistrationData, User, VerificationResponse } from '@/types/type';
import { apiClient, authApi } from '@/lib/api-client';
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
            if (response.data?.user && response.data.user.userId) {
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
     * Checks if the user is authenticated by verifying token exists
     */
    const checkAuth = async () => {
        try {
            // Check in both localStorage and cookies for token
            const token = localStorage.getItem('token') || Cookies.get('auth-token');
            const userData = JSON.parse(localStorage.getItem('userData') || 'null');
            
            if (!token || !userData) {
                return false;
            }

            // Ensure token is stored in both places
            if (token) {
                setAuthToken(token);
            }
            
            setUser({
                id: userData.userId,
                email: userData.email,
                name: userData.fullName,
                role: userData.accountStatus === 'active' ? 'user' : 'pending',
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
        removeAuthToken();
        localStorage.removeItem('userData');
        setUser(null);
    };

    /**
     * Authenticates a user with email and password
     */
    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await authApi.login(email, password);
            console.log("Login response:", response); // Debug log
            
            // Handle the response structure based on your API format
            const data = response.data || response;
            const token = data.token;
            const user = data.user;
            
            // Check if the response contains a token
            if (!token) {
                console.error('Login response missing token:', data);
                throw new Error("Login successful but token not received. Please try again.");
            }

            // Store token in both localStorage and cookies
            setAuthToken(token);
            
            // Check if user data exists and if user is verified
            if (user && (!user.email_verified && !user.phone_verified)) {
                // Store user data for verification page
                const userData = {
                    userId: user.userId,
                    email: user.email || email
                };
                
                setVerificationRedirectData(userData);
                
                // Store in various places for verification page
                localStorage.setItem("tempUserId", user.userId);
                localStorage.setItem("tempEmail", user.email || email);
                sessionStorage.setItem("verificationUserId", user.userId);
                sessionStorage.setItem("verificationEmail", user.email || email);
                sessionStorage.setItem("preferredContactMethod", user.preferredContactMethod || "email");
                sessionStorage.setItem("returnUrl", "/dashboard");
                
                toast.info("Account verification required", {
                    description: "Redirecting to verification page...",
                    duration: 3000
                });
                
                router.push('/pages/auth/otp-verify');
                return;
            }

            // Store user data in localStorage for future reference
            if (user) {
                localStorage.setItem('userData', JSON.stringify(user));
                
                setUser({
                    id: user.userId,
                    email: user.email,
                    name: user.fullName,
                    role: user.accountStatus === 'active' ? 'user' : 'pending',
                });
                
                toast.success('Successfully logged in');
                
                // Use setTimeout to ensure state updates have processed
                setTimeout(() => {
                    const redirectTo = sessionStorage.getItem('redirectTo') || '/pages/user/dashboard';
                    sessionStorage.removeItem('redirectTo'); // Clear after use
                    router.push(redirectTo);
                }, 100);
            } else {
                throw new Error('User data not received in response');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            
            // Handle specific verification required error
            if (error.requiresVerification && error.userId) {
                const userData = {
                    userId: error.userId,
                    email: email
                };
                
                setVerificationRedirectData(userData);
                
                // Store data for verification page
                localStorage.setItem("tempUserId", error.userId);
                localStorage.setItem("tempEmail", email);
                sessionStorage.setItem("verificationUserId", error.userId);
                sessionStorage.setItem("verificationEmail", email);
                sessionStorage.setItem("returnUrl", "/dashboard");
                
                toast.info("Account verification required", {
                    description: "Redirecting to verification page...",
                    duration: 3000
                });
                
                router.push('/pages/auth/otp-verify');
                return;
            }
            
            const errorMessage = getReadableErrorMessage(error);
            toast.error("Login failed", {
                description: errorMessage,
                duration: 4000
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
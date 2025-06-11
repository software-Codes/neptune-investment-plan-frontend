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
 * @component
 * @param {AuthProviderProps} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [verificationRedirectData, setVerificationRedirectData] = useState<{ userId?: string; email?: string } | null>(null);
    const router = useRouter();

    /**
     * Registers a new user
     * @param {RegistrationData} data - User registration data
     * @throws {Error} When registration fails
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
                toast.success(
                    response.data.message || 
                    `Verification code sent via ${data.preferredContactMethod}. Please verify your account.`
                );
                
                // Redirect to verification page
                router.push('/pages/auth/otp-verify');
            } else {
                toast.success('Registration successful. Please check your email or phone for verification.');
                router.push('/pages/auth/otp-verify');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            
            // Improved error messaging
            const errorMessage = getReadableErrorMessage(error);
            toast.error(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Verifies the current authentication status
     * @returns {Promise<boolean>} True if authenticated, false otherwise
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
     * @private
     */
    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    /**
     * Authenticates a user with email and password
     * @param {string} email - User's email
     * @param {string} password - User's password
     * @throws {Error} When login fails
     */
    const login = async (email: string, password: string): Promise<void> => {
        setIsLoading(true);
        try {
            const response = await authApi.login(email, password);
            const { token } = response.data;

            if (!token) {
                throw new Error('Invalid response from server');
            }

            localStorage.setItem('token', token);
            const authSuccess = await checkAuth();
            
            if (authSuccess) {
                toast.success('Successfully logged in');
                return;
            } else {
                throw new Error('Failed to retrieve user details');
            }
        } catch (error: any) {
            console.error('Login error:', error);

            if (error.requiresVerification) {
                toast.error('Account not verified. Please verify your account first.');
                
                // Store user ID for verification if available
                if (error.userId) {
                    setVerificationRedirectData({
                        userId: error.userId,
                        email
                    });
                    
                    // Redirect to verification page
                    router.push('/pages/auth/otp-verify');
                    return;
                }
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
            toast.success('Successfully logged out');
        } catch (error) {
            console.error('Logout error:', error);
            // Even if server logout fails, clear local state
            toast.error('An error occurred during logout, but you have been logged out locally');
        } finally {
            handleLogout();
            // Redirect to the login page within the auth pages directory
            router.push('/pages/auth/login');
            setIsLoading(false);
        }
    };
    
    /**
     * Formats error messages to be more user-friendly
     * @param {any} error - The error object
     * @returns {string} A readable error message
     */
    const getReadableErrorMessage = (error: any): string => {
        // Check for specific error messages and transform them
        const message = error.message || 'An unknown error occurred';
        
        if (message.includes('already exists')) {
            return message;
        }
        
        if (message.includes('no internet') || message.includes('connect')) {
            return 'Unable to connect to the server. Please check your internet connection.';
        }
        
        if (message.includes('timeout')) {
            return 'Server is taking too long to respond. Please try again later.';
        }
        
        if (message.includes('Invalid email or password')) {
            return 'The email or password you entered is incorrect. Please try again.';
        }
        
        if (message.includes('not verified')) {
            return 'Your account needs verification. Please check your email or phone for the verification code.';
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
        return <div className="flex h-screen w-screen items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>;
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}
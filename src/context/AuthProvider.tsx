/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
            toast.success(response.data.message); // Note the .data accessor
            router.push('/pages/auth/otp-verify');
        } catch (error: any) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Registration failed');
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
            const userData = response.data; // Access the data property of AxiosResponse
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
            const { token } = response.data;  // Access the data property of AxiosResponse

            if (!token) {
                throw new Error('Invalid response from server');
            }

            localStorage.setItem('token', token);
            await checkAuth();
            toast.success('Successfully logged in');
        } catch (error: any) {
            console.error('Login error:', error);

            if (error.requiresVerification) {
                toast.error('Please verify your account before logging in');
            } else if (error.message.includes('Unable to reach server')) {
                toast.error('Cannot connect to server. Please check your internet connection.');
            } else {
                toast.error(error.message || 'Login failed');
            }
            

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
            toast.error('An error occurred during logout');
        } finally {
            handleLogout();
            router.push('/login');
            setIsLoading(false);
        }
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
        register
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
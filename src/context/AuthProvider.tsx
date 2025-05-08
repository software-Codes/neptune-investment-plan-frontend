/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/context/AuthProvider.tsx
"use client"

import React, { createContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContextType, User } from '@/types/type';
import { apiClient, authApi } from '@/lib/api-client';
import { toast } from 'sonner';

// Create context with a default undefined value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const router = useRouter();

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return false;
            }

            const userData = await authApi.verify();

            // Map backend user data to our User type
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };
    const login = async (email: string, password: string): Promise<void> => {
        setIsLoading(true);
        try {
            const response = await authApi.login(email, password);

            if (!response.token) {
                throw new Error('Invalid response from server');
            }

            // Store token
            localStorage.setItem('token', response.token);

            // Fetch user data
            await checkAuth();

            toast.success('Successfully logged in');
        } catch (error: any) {
            console.error('Login error:', error);

            // Handle specific error cases
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

    const contextValue: AuthContextType = {
        user,
        isLoading,
        login,
        logout,
        checkAuth,
    };

    // Only render children when authentication is initialized
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
import React, { createContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContextType, User } from '@/types/type';

// Create context with a default undefined value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token'); // Fixed typo from 'item' to 'token'
            if (!token) {
                return false;
            }

            const response = await fetch('/api/auth/verify', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                return true;
            }
            
            handleLogout();
            return false;
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

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            setUser(data.user);
            router.push('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            handleLogout();
            router.push('/login');
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            await checkAuth();
            setIsLoading(false);
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

    return (
        <AuthContext.Provider value={contextValue}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
}
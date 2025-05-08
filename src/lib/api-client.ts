/* eslint-disable @typescript-eslint/no-unused-vars */
import { toast } from "sonner";

interface ApiErrorResponse {
  message: string;
  requiresVerification?: boolean;
  userId?: string;
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function apiClient<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Default headers
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Get token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Merge headers
  const headers = {
    ...defaultHeaders,
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies if needed
    });

    // Handle non-OK responses
    if (!response.ok) {
      let errorData: ApiErrorResponse;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          message: `HTTP error! status: ${response.status}`,
        };
      }

      const error = new Error(errorData.message || 'An error occurred');
      Object.assign(error, errorData);
      throw error;
    }

    return await response.json();
  } catch (error) {
    // Network or parsing errors
    if (!window.navigator.onLine) {
      throw new Error('No internet connection. Please check your network.');
    }

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error(`API endpoint not reachable: ${url}`);
      throw new Error(`Unable to reach server at ${API_BASE_URL}. Please check the API URL and try again.`);
    }

    // Re-throw the error with additional context
    console.error('API request failed:', {
      url,
      error,
      headers: Object.fromEntries(
        Object.entries(headers).map(([k, v]) => [k, k === 'Authorization' ? '[REDACTED]' : v])
      ),
    });

    throw error;
  }
}

// Auth API endpoints
export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient<{
        success: true;
        token: string;
        session: {
          sessionId: string;
          expiresAt: string;
        };
      }>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      return response;
    } catch (error) {
      console.error('Login request failed:', error);
      throw error;
    }
  },

  verify: async () => {
    try {
      return await apiClient<{
        userId: string;
        email: string;
        fullName: string;
        accountStatus: string;
      }>('/api/v1/auth/verify', {
        method: 'GET',
      });
    } catch (error) {
      console.error('Verification request failed:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      return await apiClient<{ success: true }>('/api/v1/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
      throw error;
    }
  },
};
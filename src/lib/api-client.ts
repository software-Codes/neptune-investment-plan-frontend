/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/api-client.ts
import axios, { AxiosError } from "axios";
import { RegistrationData, RegistrationResponse, VerificationResponse } from "@/types/type";
import Cookies from 'js-cookie';

/**
 * Base URL for API requests
 * Falls back to localhost:4000 if NEXT_PUBLIC_API_URL is not set
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * Cookie configuration for token storage
 */
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const
};

/**
 * Axios instance with default configuration
 * Includes authorization token handling and error interceptors
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Increased timeout for slower connections
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Helper function to get the authentication token from multiple sources
 * Checks both localStorage and cookies for compatibility with middleware
 */
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem("token") || Cookies.get('auth-token') || null;
};

/**
 * Request interceptor
 * Adds authentication token to requests if available
 */
axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor
 * Handles common error cases and transforms error responses
 */
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    // Network error handling
    if (typeof window !== 'undefined' && !window.navigator.onLine) {
      throw new Error("No internet connection. Please check your network and try again.");
    }

    if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout. The server is taking too long to respond.");
    }

    // Handle server unreachable errors
    if (!error.response) {
      throw new Error("Unable to reach server. Please check your connection and try again.");
    }

    // Extract detailed error information
    const errorResponse = error.response?.data as any;
    const status = error.response?.status;
    
    // Create base error message
    let errorMessage = errorResponse?.message || error.message || "An unexpected error occurred";
    
    // Handle specific status codes
    switch (status) {
      case 400:
        if (errorMessage.includes("expired") || errorMessage.includes("invalid")) {
          errorMessage = "Invalid or expired verification code. Please try again.";
        } else if (errorMessage.includes("already verified")) {
          errorMessage = "Account is already verified.";
        }
        break;
      case 401:
        // For authentication failures, we may need to clear tokens
        if (typeof window !== 'undefined') {
          if (errorMessage.includes("token") || errorMessage.includes("unauthorized")) {
            localStorage.removeItem("token");
            Cookies.remove('auth-token');
            
            // Optionally redirect to login page if token is invalid
            if (window.location.pathname !== '/login' && 
                !window.location.pathname.includes('/auth/')) {
              window.location.href = '/login?redirectTo=' + encodeURIComponent(window.location.pathname);
            }
          }
        }
        break;
      case 403:
        errorMessage = "You don't have permission to access this resource.";
        break;
      case 404:
        if (errorMessage.includes("User not found")) {
          errorMessage = "Account not found. Please check your details or register again.";
        }
        break;
      case 429:
        errorMessage = "Too many requests. Please wait a moment before trying again.";
        break;
      case 500:
        errorMessage = "Server error. Our team has been notified. Please try again later.";
        break;
    }

    // Create a custom error with extended properties
    const customError = new Error(errorMessage);
    Object.assign(customError, {
      requiresVerification: errorResponse?.requiresVerification || false,
      userId: errorResponse?.userId,
      email: errorResponse?.email,
      statusCode: status,
      isNetworkError: !error.response,
      isServerError: status ? status >= 500 : false,
      isClientError: status ? status >= 400 && status < 500 : false,
      errorDetails: errorResponse,
      originalMessage: error.message,
      preferredContactMethod: errorResponse?.preferredContactMethod
    });

    throw customError;
  }
);

/**
 * Authentication API methods
 * Handles all authentication-related API calls with enhanced error handling
 */
export const authApi = {
  /**
   * Authenticates user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} Authentication response with token and session data
   */
  login: async (email: string, password: string) => {
    try {
      console.log("Login attempt:", { email, apiUrl: API_BASE_URL });
      const response = await axiosInstance.post("/api/v1/auth/login", {
        email,
        password,
      });
      
      // Store token in cookies for middleware compatibility
      if (response.data.token) {
        Cookies.set('auth-token', response.data.token, COOKIE_OPTIONS);
      }
      
      return response;
    } catch (error: any) {
      console.error("Login request failed:", error);
      
      // Enhanced error messages for login
      if (error.message.includes("invalid credentials") || 
          error.message.includes("Invalid email or password")) {
        throw new Error("Invalid email or password. Please check your credentials and try again.");
      } else if (error.message.includes("not verified") || 
                 error.message.includes("verification required")) {
        // Preserve verification data
        const verificationError = new Error("Account requires verification. Please check your email or phone for the verification code.");
        Object.assign(verificationError, {
          requiresVerification: true,
          userId: error.userId || error.errorDetails?.userId,
          email: email,
          preferredContactMethod: error.errorDetails?.preferredContactMethod || "email"
        });
        throw verificationError;
      }
      
      throw error;
    }
  },

  /**
   * Logs out the current user
   * @returns {Promise} Logout confirmation
   */
// Update the logout method in authApi
logout: async () => {
  try {
    const response = await axiosInstance.post("/api/v1/auth/logout");
    
    // Clear auth tokens regardless of response
    if (typeof window !== 'undefined') {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      Cookies.remove('auth-token');
    }
    
    // Check if logout was successful
    if (response.data.success === false) {
      throw new Error(response.data.message || "Logout failed");
    }
    
    return response;
  } catch (error: any) {
    console.error("Logout request failed:", error);
    
    // Always clear local tokens even if server logout fails
    if (typeof window !== 'undefined') {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      Cookies.remove('auth-token');
    }
    
    throw error;
  }
},

  /**
   * Registers a new user
   * @param {RegistrationData} userData - User registration data
   * @returns {Promise<RegistrationResponse>} Registration confirmation and user data
   */
  register: async (userData: RegistrationData) => {
    try {
      console.log("Registration attempt:", {
        email: userData.email,
        apiUrl: API_BASE_URL,
      });
      
      // Input validation for registration
      if (!userData.email || !userData.password) {
        throw new Error("Email and password are required for registration.");
      }
      
      const response = await axiosInstance.post(
        "/api/v1/auth/register",
        userData
      );
      
      // Store verification data in session for persistent access across page navigation
      if (response.data?.user?.userId) {
        sessionStorage.setItem("verificationUserId", response.data.user.userId);
        sessionStorage.setItem("verificationEmail", userData.email);
        sessionStorage.setItem("preferredContactMethod", userData.preferredContactMethod || "email");
      }
      
      return response;
    } catch (error: any) {
      console.error("Registration request failed:", error);
      
      // Enhanced error messages for registration
      if (error.message.includes("already exists")) {
        throw new Error("An account with this email already exists. Please sign in instead.");
      } else if (error.message.includes("password") && error.message.includes("requirements")) {
        throw new Error("Password does not meet security requirements. Please use a stronger password.");
      }
      
      throw error;
    }
  },

  /**
   * Resends OTP verification code with enhanced error handling
   * @param {string} userId - User ID
   * @param {string} email - User email (optional)
   * @param {string} method - Contact method (email or phone, default: email)
   * @returns {Promise} Resend confirmation
   */
  resendOTP: async (userId: string, email?: string, method: string = "email") => {
    try {
      console.log("Resending OTP for user:", userId);
      
      if (!userId) {
        throw new Error("User ID is required to resend verification code.");
      }
      
      const payload: any = { userId };
      
      // Add email if provided for better error recovery
      if (email) {
        payload.email = email;
      }
      
      // Add contact method if different from default
      if (method && method !== "email") {
        payload.contactMethod = method;
      }
      
      const response = await axiosInstance.post("/api/v1/auth/resend-verification", payload);
      
      return response;
    } catch (error: any) {
      console.error("Resend OTP request failed:", error);
      
      // Add specific error handling for resend
      if (error.message.includes("already verified")) {
        throw new Error("Account is already verified. No need to resend the code.");
      } else if (error.message.includes("User not found")) {
        throw new Error("Account not found. Please try registering again.");
      } else if (error.statusCode === 429) {
        throw new Error("Too many requests. Please wait a moment before requesting another code.");
      }
      
      throw error;
    }
  },

  /**
   * Verifies OTP code with enhanced error handling and retry logic
   * @param {string} userId - User ID
   * @param {string} otpCode - OTP code to verify
   * @param {string} purpose - Purpose of OTP (default: 'registration')
   * @returns {Promise<VerificationResponse>} Verification result with token and user data
   */
  verifyOTP: async (userId: string, otpCode: string, purpose: string = "registration") => {
    try {
      console.log("Verifying OTP:", { userId, otpLength: otpCode.length, purpose });
      
      // Input validation
      if (!userId) {
        throw new Error("User ID is required for verification.");
      }
      
      if (!otpCode || otpCode.length !== 6) {
        throw new Error("Please enter a valid 6-digit verification code.");
      }
      
      // Ensure OTP contains only digits
      if (!/^\d{6}$/.test(otpCode)) {
        throw new Error("Verification code must contain only numbers.");
      }
      
      const response = await axiosInstance.post("/api/v1/auth/verify-otp", {
        userId,
        otpCode,
        purpose,
      });
      
      // Handle successful verification with token and user data
      if (response.data.token) {
        // Store token in both localStorage and cookies for middleware compatibility
        localStorage.setItem("token", response.data.token);
        Cookies.set('auth-token', response.data.token, COOKIE_OPTIONS);

        // Store user data if provided
        if (response.data.user) {
          localStorage.setItem("userData", JSON.stringify(response.data.user));
        }
      }

      return response.data;
    } catch (error: any) {
      console.error("OTP verification request failed:", error);
      
      // Enhanced error messages for OTP verification
      if (error.message.includes("Invalid") || error.message.includes("expired")) {
        throw new Error("Invalid or expired verification code. Please check the code or request a new one.");
      } else if (error.message.includes("User not found")) {
        throw new Error("Account not found. Please try registering again.");
      } else if (error.message.includes("already verified")) {
        throw new Error("Account is already verified.");
      } else if (error.statusCode === 429) {
        throw new Error("Too many verification attempts. Please wait before trying again.");
      }
      
      throw error;
    }
  },
  
  /**
   * Silently checks if the current user's authentication is valid
   * Can be used for periodic validation of the token
   * @returns {Promise<boolean>} True if the token is valid
   */
  validateToken: async () => {
    try {
      const token = getAuthToken();
      if (!token) return false;
      
      const response = await axiosInstance.get("/api/v1/auth/validate-token");
      return true;
    } catch (error) {
      // Token is invalid - clear it from storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
        Cookies.remove('auth-token');
      }
      return false;
    }
  },
  
  /**
   * Password reset request - initiates the process
   * @param {string} email - User's email address
   * @returns {Promise} Reset request confirmation
   */
  requestPasswordReset: async (email: string) => {
    try {
      if (!email) {
        throw new Error("Email is required to reset password.");
      }
      
      const response = await axiosInstance.post("/api/v1/auth/request-reset", {
        email,
      });
      
      return response;
    } catch (error: any) {
      console.error("Password reset request failed:", error);
      
      // Even for "user not found" cases, provide a generic message for security
      if (error.message.includes("User not found")) {
        throw new Error("If an account exists with this email, reset instructions have been sent.");
      }
      
      throw error;
    }
  },
  
  /**
   * Password reset completion
   * @param {string} token - Reset token from email
   * @param {string} newPassword - New password
   * @returns {Promise} Reset completion confirmation
   */
  completePasswordReset: async (token: string, newPassword: string) => {
    try {
      if (!token || !newPassword) {
        throw new Error("Token and new password are required.");
      }
      
      const response = await axiosInstance.post("/api/v1/auth/reset-password", {
        token,
        newPassword,
      });
      
      return response;
    } catch (error: any) {
      console.error("Password reset completion failed:", error);
      
      if (error.message.includes("expired") || error.message.includes("invalid token")) {
        throw new Error("This password reset link has expired or is invalid. Please request a new one.");
      } else if (error.message.includes("password") && error.message.includes("requirements")) {
        throw new Error("Password does not meet security requirements. Please use a stronger password.");
      }
      
      throw error;
    }
  },
  // Add this to authApi object
getCurrentUser: async () => {
  try {
    const response = await axiosInstance.get("/api/v1/users/current");
    
    if (!response.data.success || !response.data.user) {
      throw new Error("Failed to fetch user details");
    }
    
    return {
      user: response.data.user,
      wallets: response.data.wallets,
      accountCompletion: response.data.accountCompletion
    };
  } catch (error: any) {
    console.error("Failed to fetch user details:", error);
    throw error;
  }
}
};

  
export { axiosInstance as apiClient };
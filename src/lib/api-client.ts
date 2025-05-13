/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/api-client-updated.ts
import axios, { AxiosError } from "axios";
import { RegistrationData, RegistrationResponse } from "@/types/type";

/**
 * Base URL for API requests
 * Falls back to localhost:4000 if NEXT_PUBLIC_API_URL is not set
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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
 * Request interceptor
 * Adds authentication token to requests if available
 */
axiosInstance.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
    if (!window.navigator.onLine) {
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
      statusCode: status,
      isNetworkError: !error.response,
      isServerError: status ? status >= 500 : false,
      isClientError: status ? status >= 400 && status < 500 : false,
      errorDetails: errorResponse,
      originalMessage: error.message,
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
      return response;
    } catch (error: any) {
      console.error("Login request failed:", error);
      
      // Enhanced error messages for login
      if (error.message.includes("invalid credentials")) {
        throw new Error("Invalid email or password. Please check your credentials and try again.");
      } else if (error.message.includes("not verified")) {
        // Preserve verification data
        const verificationError = new Error("Account requires verification. Please check your email or phone for the verification code.");
        Object.assign(verificationError, {
          requiresVerification: true,
          userId: error.userId
        });
        throw verificationError;
      }
      
      throw error;
    }
  },

  /**
   * Verifies current authentication status
   * @returns {Promise} User data if verified
   */
  verify: async () => {
    try {
      const response = await axiosInstance.get("/api/v1/auth/verify");
      return response;
    } catch (error) {
      console.error("Verification request failed:", error);
      throw error;
    }
  },

  /**
   * Logs out the current user
   * @returns {Promise} Logout confirmation
   */
  logout: async () => {
    try {
      const response = await axiosInstance.post("/api/v1/auth/logout");
      return response;
    } catch (error) {
      console.error("Logout request failed:", error);
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
      const response = await axiosInstance.post(
        "/api/v1/auth/register",
        userData
      );
      return response;
    } catch (error: any) {
      console.error("Registration request failed:", error);
      
      // Enhanced error messages for registration
      if (error.message.includes("already exists")) {
        throw new Error("An account with this email already exists. Please sign in instead.");
      }
      
      throw error;
    }
  },

  /**
   * Resends OTP verification code with enhanced error handling
   * @param {string} userId - User ID
   * @returns {Promise} Resend confirmation
   */
  resendOTP: async (userId: string) => {
    try {
      console.log("Resending OTP for user:", userId);
      
      if (!userId) {
        throw new Error("User ID is required to resend verification code.");
      }
      
      const response = await axiosInstance.post("/api/v1/auth/resend-verification", {
        userId,
      });
      
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
   * @returns {Promise} Verification result
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
      
      return response;
    } catch (error: any) {
      console.error("OTP verification request failed:", error);
      
      // Enhanced error messages for OTP verification
      if (error.message.includes("Invalid or expired")) {
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
};
  
export { axiosInstance as apiClient };
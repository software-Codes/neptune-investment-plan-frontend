// src/lib/api-client.ts
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
    if (!window.navigator.onLine) {
      throw new Error("No internet connection. Please check your network.");
    }

    if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout. Please try again later.");
    }

    // Handle server unreachable errors
    if (!error.response) {
      throw new Error("Unable to reach server. Please try again later.");
    }

    // Extract detailed error information
    const errorResponse = error.response?.data as any;
    const errorMessage =
      errorResponse?.message || error.message || "An unknown error occurred";

    // Create a custom error with extended properties
    const customError = new Error(errorMessage);
    Object.assign(customError, {
      requiresVerification: errorResponse?.requiresVerification || false,
      userId: errorResponse?.userId,
      statusCode: error.response?.status,
      isNetworkError: !error.response,
      isServerError: error.response?.status
        ? error.response.status >= 500
        : false,
      isClientError: error.response?.status
        ? error.response.status >= 400 && error.response.status < 500
        : false,
      errorDetails: errorResponse,
    });

    throw customError;
  }
);

/**
 * Authentication API methods
 * Handles all authentication-related API calls
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
    } catch (error) {
      console.error("Login request failed:", error);
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
    } catch (error) {
      console.error("Registration request failed:", error);
      throw error;
    }
  },

  /**
   * Resends OTP verification code
   * @param {string} userId - User ID
   * @param {string} method - Delivery method (email or phone)
   * @returns {Promise} Resend confirmation
   */
  resendOTP: async (userId: string, method: "email" | "phone") => {
    try {
      const response = await axiosInstance.post("/api/v1/auth/resend-otp", {
        userId,
        deliveryMethod: method,
      });
      return response;
    } catch (error) {
      console.error("Resend OTP request failed:", error);
      throw error;
    }
  },

  /**
   * Verifies OTP code
   * @param {string} userId - User ID
   * @param {string} otpCode - OTP code
   * @returns {Promise} Verification result
   */
  verifyOTP: async (userId: string, otpCode: string) => {
    try {
      const response = await axiosInstance.post("/api/v1/auth/verify-otp", {
        userId,
        otpCode,
      });
      return response;
    } catch (error) {
      console.error("OTP verification request failed:", error);
      throw error;
    }
  },
};

export { axiosInstance as apiClient };

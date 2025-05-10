import axios, { AxiosError } from "axios";
import { RegistrationData, RegistrationResponse } from "@/types/type";

/**
 * Base URL for API requests
 * Falls back to localhost:4000 if NEXT_PUBLIC_API_URL is not set
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * Axios instance with default configuration
 * Includes authorization token handling and error interceptors
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
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
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
      throw new Error("Request timeout. Please try again.");
    }

    const errorMessage = (error.response?.data as any)?.message || error.message;
    const customError = new Error(errorMessage);
    Object.assign(customError, {
      requiresVerification: (error.response?.data as any)?.requiresVerification,
      userId: (error.response?.data as any)?.userId,
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
      const response = await axiosInstance.post<{
        success: boolean;
        token: string;
        session: {
          sessionId: string;
          expiresAt: string;
        };
      }>("/api/v1/auth/login", { email, password });
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
      const response = await axiosInstance.get<{
        userId: string;
        email: string;
        fullName: string;
        accountStatus: string;
      }>("/api/v1/auth/verify");
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
      const response = await axiosInstance.post<{ success: boolean }>(
        "/api/v1/auth/logout"
      );
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
      const response = await axiosInstance.post<RegistrationResponse>(
        "/api/v1/auth/register",
        userData
      );
      return response;
    } catch (error) {
      console.error("Registration request failed:", error);
      throw error;
    }
  },
};

export { axiosInstance as apiClient };
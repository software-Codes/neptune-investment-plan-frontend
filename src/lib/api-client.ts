/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/api-client.ts
import axios, { AxiosError } from "axios";
import {
  RegistrationData,
  RegistrationResponse,
  VerificationResponse,
  LoginResponse,
  PasswordResetInitiationResponse,
  PasswordResetCompletionResponse,
  UserProfile,
  KYCDocument,
  APIResponse,
} from "@/types/type";
import Cookies from "js-cookie";

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
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
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
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || Cookies.get("auth-token") || null;
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
  (response) => response,
  (error: AxiosError) => {
    // Network or server errors
    if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }

    const errorResponse = error.response?.data as APIResponse;
    
    // Handle specific error cases
    switch (error.response.status) {
      case 401:
        // Clear auth tokens on unauthorized
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          Cookies.remove('auth-token');
        }
        break;
      case 403:
        if (errorResponse.message?.includes('verification')) {
          const verificationError = new Error(errorResponse.message);
          Object.assign(verificationError, {
            requiresVerification: true,
            userId: errorResponse.data?.userId
          });
          throw verificationError;
        }
        break;
    }

    throw new Error(errorResponse.message || 'An error occurred');
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
   * @returns {Promise<LoginResponse>} Authentication response with token and session data
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      console.log("Login attempt:", { email, apiUrl: API_BASE_URL });
      const response = await axiosInstance.post<LoginResponse>(
        "/api/v1/auth/login",
        {
          email,
          password,
        }
      );

      // Store token in cookies for middleware compatibility
      if (response.data.data.token) {
        Cookies.set("auth-token", response.data.data.token, COOKIE_OPTIONS);
      }

      return response.data;
    } catch (error: any) {
      console.error("Login request failed:", error);

      // Enhanced error messages for login
      if (
        error.message.includes("invalid credentials") ||
        error.message.includes("Invalid email or password")
      ) {
        throw new Error(
          "Invalid email or password. Please check your credentials and try again."
        );
      } else if (
        error.message.includes("not verified") ||
        error.message.includes("verification required")
      ) {
        // Preserve verification data
        const verificationError = new Error(
          "Account requires verification. Please check your email or phone for the verification code."
        );
        Object.assign(verificationError, {
          requiresVerification: true,
          userId: error.userId || error.errorDetails?.userId,
          email: email,
          preferredContactMethod:
            error.errorDetails?.preferredContactMethod || "email",
        });
        throw verificationError;
      }

      throw error;
    }
  },
  /**
   * Logs out the current user
   * @returns {Promise<void>} Logout confirmation
   */
  logout: async (): Promise<void> => {
    try {
      const response = await axiosInstance.post("/api/v1/auth/logout");

      // Clear auth tokens regardless of response
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        Cookies.remove("auth-token");
      }

      // Check if logout was successful
      if (!response.data.success) {
        throw new Error(response.data.message || "Logout failed");
      }

      return;
    } catch (error: any) {
      console.error("Logout request failed:", error);

      // Always clear local tokens even if server logout fails
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        Cookies.remove("auth-token");
      }

      throw error;
    }
  },
  /**
   * Registers a new user
   * @param {RegistrationData} userData - User registration data
   * @returns {Promise<RegistrationResponse>} Registration confirmation and user data
   */
 register: async (userData: RegistrationData): Promise<RegistrationResponse> => {
  try {
    // Input validation
    if (!userData.email || !userData.password || !userData.full_name || !userData.phone_number) {
      throw new Error('All required fields must be filled');
    }

    const response = await axiosInstance.post('/api/v1/auth/register', {
      fullName: userData.full_name,
      email: userData.email,
      phoneNumber: userData.phone_number,
      password: userData.password,
      preferredContactMethod: userData.preferred_contact_method
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Registration failed');
    }

    // Store verification data
    if (response.data?.user?.userId) {
      sessionStorage.setItem('verificationUserId', response.data.user.userId);
      sessionStorage.setItem('verificationEmail', userData.email);
      sessionStorage.setItem('preferredContactMethod', userData.preferred_contact_method);
    }

    return response.data;
  } catch (error: any) {
    console.error('Registration failed:', error);
    throw new Error(error.message || 'Registration failed');
  }
},

  /**
   * Resends OTP verification code with enhanced error handling
   * @param {string} userId - User ID
   * @param {string} email - User email (optional)
   * @param {string} method - Contact method (email or phone, default: email)
   * @returns {Promise} Resend confirmation
   */
  resendOTP: async (
    userId: string,
    email?: string,
    method: string = "email"
  ) => {
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

      const response = await axiosInstance.post(
        "/api/v1/auth/resend-verification",
        payload
      );

      return response;
    } catch (error: any) {
      console.error("Resend OTP request failed:", error);

      // Add specific error handling for resend
      if (error.message.includes("already verified")) {
        throw new Error(
          "Account is already verified. No need to resend the code."
        );
      } else if (error.message.includes("User not found")) {
        throw new Error("Account not found. Please try registering again.");
      } else if (error.statusCode === 429) {
        throw new Error(
          "Too many requests. Please wait a moment before requesting another code."
        );
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
  verifyOTP: async (
    userId: string,
    otpCode: string,
    purpose: string = "registration"
  ) => {
    try {
      console.log("Verifying OTP:", {
        userId,
        otpLength: otpCode.length,
        purpose,
      });

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
        Cookies.set("auth-token", response.data.token, COOKIE_OPTIONS);

        // Store user data if provided
        if (response.data.user) {
          localStorage.setItem("userData", JSON.stringify(response.data.user));
        }
      }

      return response.data;
    } catch (error: any) {
      console.error("OTP verification request failed:", error);

      // Enhanced error messages for OTP verification
      if (
        error.message.includes("Invalid") ||
        error.message.includes("expired")
      ) {
        throw new Error(
          "Invalid or expired verification code. Please check the code or request a new one."
        );
      } else if (error.message.includes("User not found")) {
        throw new Error("Account not found. Please try registering again.");
      } else if (error.message.includes("already verified")) {
        throw new Error("Account is already verified.");
      } else if (error.statusCode === 429) {
        throw new Error(
          "Too many verification attempts. Please wait before trying again."
        );
      }

      throw error;
    }
  },

/**
 * Checks if the user has a valid auth token
 * @returns {boolean} True if token exists
 */
validateToken: async () => {
  const token = getAuthToken();
  return !!token; // Convert to boolean
},

  /**
   * Password reset request - initiates the process
   * @param {string} email - User's email address
   * @returns {Promise<PasswordResetInitiationResponse>} Reset request confirmation
   */
  requestPasswordReset: async (
    email: string
  ): Promise<PasswordResetInitiationResponse> => {
    try {
      if (!email) {
        throw new Error("Email is required to reset password.");
      }

      const response =
        await axiosInstance.post<PasswordResetInitiationResponse>(
          "/api/v1/auth/request-reset",
          {
            email,
          }
        );

      return response.data;
    } catch (error: any) {
      console.error("Password reset request failed:", error);

      // Even for "user not found" cases, provide a generic message for security
      if (error.message.includes("User not found")) {
        throw new Error(
          "If an account exists with this email, reset instructions have been sent."
        );
      }

      throw error;
    }
  },

  /**
   * Password reset completion
   * @param {string} token - Reset token from email
   * @param {string} newPassword - New password
   * @returns {Promise<PasswordResetCompletionResponse>} Reset completion confirmation
   */
  completePasswordReset: async (
    token: string,
    newPassword: string
  ): Promise<PasswordResetCompletionResponse> => {
    try {
      if (!token || !newPassword) {
        throw new Error("Token and new password are required.");
      }

      const response =
        await axiosInstance.post<PasswordResetCompletionResponse>(
          "/api/v1/auth/reset-password",
          {
            token,
            newPassword,
          }
        );

      return response.data;
    } catch (error: any) {
      console.error("Password reset completion failed:", error);

      if (
        error.message.includes("expired") ||
        error.message.includes("invalid token")
      ) {
        throw new Error(
          "This password reset link has expired or is invalid. Please request a new one."
        );
      } else if (
        error.message.includes("password") &&
        error.message.includes("requirements")
      ) {
        throw new Error(
          "Password does not meet security requirements. Please use a stronger password."
        );
      }

      throw error;
    }
  },
  /**
   * Fetches the current user's profile
   * @returns {Promise<UserProfile>} User profile data
   */
getCurrentUser: async (): Promise<UserProfile> => {
  try {
    const response = await axiosInstance.get("/api/v1/auth/me");

    if (!response.data?.success || !response.data?.user) {
      throw new Error("Failed to fetch user details");
    }

    // Transform backend response to match UserProfile interface
    const userProfile: UserProfile = {
      userId: response.data.user.userId,
      email: response.data.user.email,
      full_name: response.data.user.fullName,
      phone_number: response.data.user.phoneNumber,
      preferred_contact_method: response.data.user.preferredContactMethod,
      account_status: response.data.user.accountStatus,
      email_verified: response.data.user.emailVerified,
      phone_verified: response.data.user.phoneVerified,
      created_at: new Date(response.data.user.createdAt),
      last_login_at: response.data.user.lastLogin ? new Date(response.data.user.lastLogin) : undefined,
      role: response.data.user.accountStatus === 'active' ? 'user' : 'pending',
      wallets: response.data.wallets.map((wallet: any) => ({
        wallet_id: wallet.wallet_id,
        user_id: wallet.user_id,
        currency: wallet.currency,
        balance: wallet.balance,
        status: wallet.status,
        created_at: new Date(wallet.created_at),
        updated_at: new Date(wallet.updated_at)
      })),
      accountCompletion: response.data.accountCompletion
    };

    return userProfile;
  } catch (error: any) {
    console.error("Failed to fetch user details:", error);
    throw error;
  }
},
uploadDocument: async (
  file: File,
  documentType: string,
  documentCountry: string
): Promise<KYCDocument> => {
  try {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    formData.append('documentCountry', documentCountry);

    const response = await axiosInstance.post('/api/v1/users/documents/upload', 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Document upload failed');
    }

    return response.data.document;
  } catch (error: any) {
    console.error('Document upload failed:', error);
    throw new Error(error.message || 'Failed to upload document');
  }
},
getDocumentStatus: async (documentId: string): Promise<KYCDocument> => {
  try {
    const response = await axiosInstance.get(`/api/v1/users/documents/${documentId}`);

    if (!response.data?.success) {
      throw new Error('Failed to fetch document status');
    }

    return response.data.document;
  } catch (error: any) {
    console.error('Failed to fetch document status:', error);
    throw error;
  }
},
getUserDocuments: async (): Promise<KYCDocument[]> => {
  try {
    const response = await axiosInstance.get('/api/v1/users/documents');

    if (!response.data?.success) {
      throw new Error('Failed to fetch user documents');
    }

    return response.data.documents;
  } catch (error: any) {
    console.error('Failed to fetch user documents:', error);
    throw error;
  }
},
logoutAllDevices: async (): Promise<void> => {
  try {
    const response = await axiosInstance.post('/api/v1/auth/logout-all-devices');

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to logout from all devices');
    }

    // Clear local auth data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      Cookies.remove('auth-token');
    }
  } catch (error: any) {
    console.error('Logout all devices failed:', error);
    throw error;
  }
},

};

export { axiosInstance as apiClient };

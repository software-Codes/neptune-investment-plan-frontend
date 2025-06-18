
"use client";
import axios, { AxiosError } from "axios";
import {
  RegistrationData,
  RegistrationResponse,
  LoginResponse,
  PasswordResetInitiationResponse,
  PasswordResetCompletionResponse,
  UserProfile,
  KYCDocument,
  APIResponse,
  PasswordResetState,
  ContactMethod,
  KYCUploadResponse,
  KYCStatusResponse,
  KYCListResponse,
} from "@/types/types";
import Cookies from "js-cookie";
import {
  DocumentVerificationStatus,
  OTPVerificationResponse,
} from "@/types/types";
import { VerificationResponse } from "@/types/type";


export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";


const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};


const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Increased timeout for slower connections
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});


const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || Cookies.get("auth-token") || null;
};


axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error("Full error object:", error);

    // Network errors (no response received)
    if (!error.response) {
      // More detailed network error handling
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Request timed out. Please check your internet connection."
        );
      }

      if (error.message.includes("Network Error")) {
        throw new Error(
          "Unable to connect to the server. Please check your internet connection."
        );
      }

      // Fallback generic network error
      throw new Error("Network error. Unable to complete the request.");
    }

    // Server responded with an error
    const errorResponse = error.response?.data as APIResponse;
    const statusCode = error.response.status;

    console.error("Server error response:", errorResponse);

    // Detailed error handling based on status code
    switch (statusCode) {
      case 400:
        // Bad request - typically validation errors
        throw new Error(
          errorResponse.message ||
            "Invalid request. Please check your input and try again."
        );

      case 401:
        // Unauthorized - clear auth tokens
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          Cookies.remove("auth-token");
        }
        throw new Error(
          errorResponse.message || "Authentication failed. Please log in again."
        );

      case 403:
        // Forbidden - handle specific verification scenarios
        if (errorResponse.message?.includes("verification")) {
          const verificationError = new Error(
            errorResponse.message ||
              "Account requires verification. Please verify your account."
          );
          Object.assign(verificationError, {
            requiresVerification: true,
            userId: errorResponse.data?.userId,
          });
          throw verificationError;
        }
        throw new Error(
          errorResponse.message ||
            "Access denied. You do not have permission to perform this action."
        );

      case 404:
        throw new Error(
          errorResponse.message || "The requested resource was not found."
        );

      case 409:
        // Conflict - typically for duplicate entries
        throw new Error(
          errorResponse.message ||
            "A conflict occurred. The resource may already exist."
        );

      case 422:
        // Unprocessable Entity - validation errors
        throw new Error(
          errorResponse.message || "Validation failed. Please check your input."
        );

      case 429:
        // Too Many Requests
        throw new Error(
          "Too many requests. Please wait a moment and try again."
        );

      case 500:
        // Internal Server Error
        throw new Error(
          "Server error. Our team has been notified. Please try again later."
        );

      default:
        // Generic error for any other status codes
        throw new Error(
          errorResponse.message ||
            "An unexpected error occurred. Please try again."
        );
    }
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

      // Check for verification status in response
      if (
        response.data?.data?.user &&
        // only require verification if neither email nor phone is verified
        !response.data.data.user.email_verified &&
        !response.data.data.user.phone_verified
      ) {
        const verificationError = new Error("Account requires verification");
        Object.assign(verificationError, {
          requiresVerification: true,
          userId: response.data.data.user.user_id,
          email,
          preferredContactMethod:
            response.data.data.user.preferred_contact_method ??
            ContactMethod.EMAIL,
        });
        throw verificationError;
      }

      // Store token in cookies for middleware compatibility
      if (response.data?.data?.token) {
        Cookies.set("auth-token", response.data.data.token, COOKIE_OPTIONS);
      }

      return response.data;
    } catch (error: any) {
      console.error("Login request failed:", error);

      // Check for specific verification error responses from server
      if (
        error.response?.data?.message?.includes("not verified") ||
        error.response?.data?.message?.includes("verification required")
      ) {
        const verificationError = new Error(
          "Account requires verification. Please verify your account to continue."
        );
        Object.assign(verificationError, {
          requiresVerification: true,
          user_id:
            error.response?.data?.user_id ||
            error.response?.data?.user?.user_id,
          email: email,
          preferredContactMethod:
            error.response?.data?.preferred_contact_method || "email",
        });
        throw verificationError;
      }

      // Handle other specific error cases
      if (error.response?.status === 401) {
        throw new Error(
          "Invalid email or password. Please check your credentials."
        );
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
  register: async (
    userData: RegistrationData
  ): Promise<RegistrationResponse> => {
    try {
      // Input validation
      if (
        !userData.email ||
        !userData.password ||
        !userData.fullName ||
        !userData.phoneNumber
      ) {
        throw new Error("All required fields must be filled");
      }

      console.log("Registration attempt:", {
        email: userData.email,
        apiUrl: API_BASE_URL,
      });

      const response = await axiosInstance.post<RegistrationResponse>(
        "/api/v1/auth/register",
        {
          fullName: userData.fullName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          password: userData.password,
          preferredContactMethod: userData.preferredContactMethod,
        }
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Registration failed");
      }

      // Store verification data
      if (response.data?.user?.user_id) {
        sessionStorage.setItem(
          "verificationUserId",
          response.data.user.user_id
        );
        sessionStorage.setItem("verificationEmail", userData.email);
        sessionStorage.setItem(
          "preferredContactMethod",
          userData.preferredContactMethod
        );
        sessionStorage.setItem("returnUrl", "/pages/user/dashboard");
      }

      return response.data;
    } catch (error: any) {
      console.error("Registration failed:", error);

      // More specific error handling
      if (error.response) {
        // Server responded with an error
        const serverError = error.response.data;

        if (serverError.message) {
          // Use specific server error message
          throw new Error(serverError.message);
        }
      }

      // Fallback to original error message or generic error
      throw error;
    }
  },

  /**
   * Resends OTP verification code with enhanced error handling
   * @param {string} userId - User ID
   * @param {string} email - User email (optional)
   * @param {string} method - Contact method (email or phone, default: email)
   * @returns {Promise<APIResponse>} Resend confirmation
   */
  resendOTP: async (
    userId: string,
    email?: string,
    method: string = "email"
  ): Promise<APIResponse> => {
    try {
      if (!userId) {
        throw new Error("User ID is required to resend verification code.");
      }

      // Send the correct field name “userId” (camelCase), not “user_id”
      const payload: any = { userId };

      if (email) {
        payload.email = email;
      }
      if (method && method !== "email") {
        payload.contact_method = method;
      }

      const response = await axiosInstance.post<APIResponse>(
        "/api/v1/auth/resend-verification",
        payload
      );

      return response.data;
    } catch (error: any) {
      // …existing error handling…
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
  ): Promise<VerificationResponse> => {
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

      const response = await axiosInstance.post<VerificationResponse>(
        "/api/v1/auth/verify-otp",
        {
          userId,
          otpCode,
          purpose,
        }
      );

      // Handle successful verification with token and user data
      if (response.data.data?.token) {
        // Store token in both localStorage and cookies for middleware compatibility
        localStorage.setItem("token", response.data.data.token);
        Cookies.set("auth-token", response.data.data.token, COOKIE_OPTIONS);

        // Store user data if provided
        if (response.data.data.user) {
          localStorage.setItem(
            "userData",
            JSON.stringify(response.data.data.user)
          );
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
  // Add or update in the authApi object
  // Add/Update these methods in the authApi object

  /**
   * Password reset request - initiates the process using email
   * @param {string} email - User's email address
   * @returns {Promise<PasswordResetInitiationResponse>} Reset request confirmation
   */
  requestPasswordReset: async (
    email: string
  ): Promise<PasswordResetInitiationResponse> => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/auth/initiate-password-reset",
        { email }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to initiate password reset"
        );
      }

      // Store reset attempt data
      const resetState: PasswordResetState = {
        email,
        userId: response.data.data.userId,
        method: response.data.data.method,
        destination: response.data.data.destination,
        attempts: 1,
        lastAttempt: new Date(),
      };

      sessionStorage.setItem("passwordResetState", JSON.stringify(resetState));

      return {
        success: true,
        message: response.data.message,
        userId: response.data.data.userId,
        method: response.data.data.method,
        destination: response.data.data.destination,
      };
    } catch (error: any) {
      // Enhanced error handling
      if (error.response?.status === 429) {
        const resetState = JSON.parse(
          sessionStorage.getItem("passwordResetState") || "{}"
        );
        throw new Error(
          `Too many attempts. Please wait ${
            resetState.cooldown || 5
          } minutes before trying again.`
        );
      }
      throw error;
    }
  },
  /**
   * Password reset completion
   * @param {string} userId - User ID from initial reset request
   * @param {string} otpCode - OTP code received by user
   * @param {string} newPassword - New password to set
   * @returns {Promise<PasswordResetCompletionResponse>} Reset completion confirmation
   */
  completePasswordReset: async (
    userId: string,
    otpCode: string,
    newPassword: string
  ): Promise<PasswordResetCompletionResponse> => {
    try {
      // Validate input
      if (!userId || !otpCode || !newPassword) {
        throw new Error("All fields are required");
      }

      // Password strength validation
      if (newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      const response = await axiosInstance.post(
        "/api/v1/auth/complete-password-reset",
        {
          userId,
          otpCode,
          newPassword,
        }
      );

      // Clear reset state on success
      sessionStorage.removeItem("passwordResetState");

      return {
        success: true,
        message: response.data.message || "Password successfully reset",
      };
    } catch (error: any) {
      // Update attempts count
      const resetState = JSON.parse(
        sessionStorage.getItem("passwordResetState") || "{}"
      );
      if (resetState.attempts) {
        resetState.attempts += 1;
        resetState.lastAttempt = new Date();
        sessionStorage.setItem(
          "passwordResetState",
          JSON.stringify(resetState)
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
        user_id: response.data.user.userId,
        email: response.data.user.email,
        full_name: response.data.user.fullName,
        phone_number: response.data.user.phoneNumber,
        preferred_contact_method: response.data.user.preferredContactMethod,
        account_status: response.data.user.accountStatus,
        email_verified: response.data.user.emailVerified,
        phone_verified: response.data.user.phoneVerified,
        created_at: new Date(response.data.user.createdAt),
        last_login_at: response.data.user.lastLogin
          ? new Date(response.data.user.lastLogin)
          : undefined,
        last_login_ip: response.data.user.lastLoginIp,
        failed_login_attempts: response.data.user.failedLoginAttempts,
        wallets: response.data.wallets.map((wallet: any) => ({
          wallet_id: wallet.wallet_id,
          user_id: wallet.user_id,
          wallet_type: wallet.wallet_type,
          balance: wallet.balance.toString(),
          locked_balance: wallet.locked_balance?.toString(),
          created_at: new Date(wallet.created_at),
          updated_at: new Date(wallet.updated_at),
        })),
        accountCompletion: {
          basicVerified: response.data.accountCompletion.basicVerified,
          documentsSubmitted: response.data.accountCompletion.documentsSubmitted,
          accountComplete: response.data.accountCompletion.accountComplete,
          requiredDocuments: response.data.accountCompletion.requiredDocuments,
          submittedDocuments: response.data.accountCompletion.submittedDocuments,
          completionPercentage: response.data.accountCompletion.completionPercentage,
          personalInfoComplete: false,
          identityVerified: false,
          bankingDetailsComplete: false,
          investmentPreferencesSet: false,
          overallCompletion: 0
        },
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
      formData.append("documentFile", file);
      formData.append("documentType", documentType);
      formData.append("documentCountry", documentCountry);

      const response = await axiosInstance.post<KYCUploadResponse>(
        "/api/v1/kyc/documents",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Document upload failed");
      }

      // Transform the response to match KYCDocument interface
      const kycDocument: KYCDocument = {
        document_id: response.data.document.document_id,
        user_id: "", // This will be filled by the backend
        document_type: response.data.document.document_type,
        document_country: documentCountry,
        verification_status: DocumentVerificationStatus.PENDING,
        blob_storage_url: response.data.document.blob_storage_url,
        uploaded_at: new Date(),
        file_type: file.type,
        file_size: file.size,
      };

      return kycDocument;
    } catch (error: any) {
      console.error("Document upload failed:", error);
      throw error;
    }
  },
  /**
   * Get status of a single KYC document
   * @returns Promise<KYCStatusResponse>
   */
  getDocumentStatus: async (documentId: string): Promise<KYCStatusResponse> => {
    try {
      const response = await axiosInstance.get<KYCStatusResponse>(
        `/api/v1/kyc/status/${documentId}`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch document status"
        );
      }

      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch document status:", error);
      throw error;
    }
  },
  /**
   * Get all KYC documents for the current user
   * @returns Promise<KYCListResponse>
   */
  getUserDocuments: async (): Promise<KYCDocument[]> => {
    try {
      const response = await axiosInstance.get<KYCListResponse>(
        "/api/v1/kyc/documents"
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch documents");
      }

      // Transform the response documents to match KYCDocument interface
      const documents: KYCDocument[] = response.data.documents.map((doc) => ({
        document_id: doc.id,
        user_id: "", // Will be filled by backend
        document_type: doc.type,
        document_country: "", // Will be filled by backend
        verification_status: doc.status,
        blob_storage_url: "", // Will be filled by backend
        uploaded_at: doc.uploadedAt,
        verified_at: doc.verifiedAt,
        verification_notes: "",
        file_type: undefined,
        file_size: undefined,
      }));

      return documents;
    } catch (error: any) {
      console.error("Failed to fetch user documents:", error);
      throw error;
    }
  },
  logoutAllDevices: async (): Promise<void> => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/auth/logout-all-devices"
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to logout from all devices"
        );
      }

      // Clear local auth data
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        Cookies.remove("auth-token");
      }
    } catch (error: any) {
      console.error("Logout all devices failed:", error);
      throw error;
    }
  },
};

export { axiosInstance as apiClient };

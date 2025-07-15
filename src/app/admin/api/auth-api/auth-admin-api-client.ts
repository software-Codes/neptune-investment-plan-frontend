import axios, { AxiosError, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import {
  LoginCredentials,
  RegisterCredentials,
  AdminProfile,
  LoginResponse,
  RegisterResponse,
  PasswordResetRequest,
  PasswordResetData,
  ProfileUpdateData,
  ApiResponse,
  ApiError,
  LoginApiResponse,
  RegisterApiResponse,
  ProfileApiResponse,
} from "@/types/admin/admin.types";

const API_BASE_URL = "http://localhost:4000";
const ADMIN_TOKEN_KEY = "admin-auth-token";

class AdminApiClient {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: `${API_BASE_URL}/api/v1/admin`,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000, // 10 seconds timeout
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = Cookies.get(ADMIN_TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error("Response interceptor error:", error);

        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }

        return Promise.reject(error);
      }
    );
  }

  private handleUnauthorized(): void {
    Cookies.remove(ADMIN_TOKEN_KEY);
    toast.error("Session expired. Please login again.");
    window.location.href = "/admin/auth/login";
  }

  private handleApiError(error: any): ApiError {
    console.error("API Error:", error);

    // Handle network errors
    if (error.code === "ECONNABORTED") {
      return {
        message: "Request timeout. Please check your connection and try again.",
        statusCode: 408,
      };
    }

    if (error.code === "ERR_NETWORK") {
      return {
        message: "Network error. Please check your connection and try again.",
        statusCode: 503,
      };
    }

    // Handle response errors
    if (error.response?.data) {
      const responseData = error.response.data;

      // Handle structured error responses
      if (responseData.message) {
        return {
          message: responseData.message,
          statusCode: error.response.status,
          error: responseData.error,
        };
      }

      // Handle string error responses
      if (typeof responseData === "string") {
        return {
          message: responseData,
          statusCode: error.response.status,
        };
      }
    }

    // Handle axios errors
    if (error.message) {
      return {
        message: error.message,
        statusCode: error.response?.status || 500,
      };
    }

    // Generic fallback
    return {
      message: "An unexpected error occurred. Please try again.",
      statusCode: 500,
    };
  }

  async login(credentials: LoginCredentials): Promise<AdminProfile> {
    try {
      const response: AxiosResponse<LoginApiResponse> =
        await this.axiosInstance.post("/auth/login", {
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
        });

      const { token, admin } = response.data.data;

      Cookies.set(ADMIN_TOKEN_KEY, token, {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return admin;
    } catch (error) {
      const apiError = this.handleApiError(error);
      throw new Error(apiError.message);
    }
  }

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    try {
      const response: AxiosResponse<RegisterApiResponse> =
        await this.axiosInstance.post("/auth/register", {
          fullName: credentials.fullName.trim(),
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
          role: credentials.role || "admin",
        });

      return response.data.data;
    } catch (error) {
      const apiError = this.handleApiError(error);
      throw new Error(apiError.message);
    }
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse<null>> =
        await this.axiosInstance.post("/auth/request-password-reset", {
          email: data.email.trim().toLowerCase(),
        });

      toast.success(response.data.message);
    } catch (error) {
      const apiError = this.handleApiError(error);
      throw new Error(apiError.message);
    }
  }

  async resetPassword(data: PasswordResetData): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse<any>> =
        await this.axiosInstance.post("/auth/reset-password", {
          email: data.email.trim().toLowerCase(),
          otpCode: data.otpCode.trim(),
          newPassword: data.newPassword,
        });

      toast.success(response.data.message);
    } catch (error) {
      const apiError = this.handleApiError(error);
      throw new Error(apiError.message);
    }
  } 

  async getProfile(): Promise<AdminProfile> {
    try {
      const response: AxiosResponse<ProfileApiResponse> =
        await this.axiosInstance.get("/me");
      return response.data.data;
    } catch (error) {
      const apiError = this.handleApiError(error);
      throw new Error(apiError.message);
    }
  }

  async updateProfile(data: ProfileUpdateData): Promise<{ adminId: string }> {
    try {
      const response: AxiosResponse<ApiResponse<{ adminId: string }>> =
        await this.axiosInstance.patch("/me", data);
      return response.data.data;
    } catch (error) {
      const apiError = this.handleApiError(error);
      throw new Error(apiError.message);
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      await this.axiosInstance.delete("/me");
      Cookies.remove(ADMIN_TOKEN_KEY);
    } catch (error) {
      const apiError = this.handleApiError(error);
      throw new Error(apiError.message);
    }
  }

  logout(): void {
    Cookies.remove(ADMIN_TOKEN_KEY);
    window.location.href = "/admin/auth/login";
  }
}

// Export singleton instance
export const adminApiClient = new AdminApiClient();

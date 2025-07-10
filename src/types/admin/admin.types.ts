// Base API Response Structure
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  statusCode?: number;
}

// Authentication Related Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  role?: string;
}

export interface AdminProfile {
  adminId: string;
  fullName: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  token: string;
  admin: AdminProfile;
}

export interface RegisterResponse {
  adminId: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
}

// Password Reset Types
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetData {
  email: string;
  otpCode: string;
  newPassword: string;
}

// Profile Update Types
export interface ProfileUpdateData {
  fullName?: string;
  currentPassword?: string;
  newPassword?: string;
}

// Error Types
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Generic API Response Types
export type AuthApiResponse<T> = ApiResponse<T>;
export type ProfileApiResponse = ApiResponse<AdminProfile>;
export type LoginApiResponse = ApiResponse<LoginResponse>;
export type RegisterApiResponse = ApiResponse<RegisterResponse>;
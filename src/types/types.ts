// src/types/types.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Contact methods for OTP or KYC notifications.
 */
export enum ContactMethod {
  EMAIL = "email",
  PHONE = "phone",
  SMS = "sms",
}

/**
 * Possible account statuses.
 */
export enum AccountStatus {
  PENDING = "pending",
  ACTIVE = "active",
  SUSPENDED = "suspended",
  DEACTIVATED = "deactivated",
}

/**
 * KYC document verification status.
 */
export enum DocumentVerificationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  NOT_SUBMITTED = "not_submitted",
}

/**
 * Core user model.
 */
export interface User {
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  preferred_contact_method: ContactMethod;
  account_status: AccountStatus;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: Date;
  updated_at?: Date;
  last_login_at?: Date;
  last_login_ip?: string;
  failed_login_attempts?: number;
}

/**
 * The “public” shape of someone’s data after logging in.
 */
export interface UserProfile extends User {
  wallets: Wallet[];
  accountCompletion: AccountCompletionStatus;
}

/**
 * A single wallet record in the database.
 */
export interface Wallet {
  wallet_id: string;
  user_id: string;
  wallet_type: "account" | "trading" | "referral";
  balance: string; // stored as a string (e.g. "123.45")
  locked_balance?: string; // optional
  created_at: Date;
  updated_at: Date;
}

/**
 * Aggregated completion status of a user’s account (e.g. KYC, basic profile, etc.).
 */
export interface AccountCompletionStatus {
  basicVerified: boolean;
  documentsSubmitted: boolean;
  accountComplete: boolean;
  requiredDocuments: string[];
  submittedDocuments: string[];
  completionPercentage: number;
}

/**
 * Shape of data when registering a new user.
 */
export interface RegistrationData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  preferredContactMethod: ContactMethod;
}

/**
 * Response from the server upon successful registration.
 */
export interface RegistrationResponse {
  success: boolean;
  user: {
    user_id: string;
    full_name: string;
    email: string;
    phone_number: string;
    preferred_contact_method: ContactMethod;
    account_status: AccountStatus;
  };
  message: string;
}

/**
 * Session info stored on login.
 */
export interface SessionData {
  sessionId: string;
  expiresAt: Date;
}

/**
 * Data returned from login endpoint.
 */
export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
    session: SessionData;
    accountCompletion: AccountCompletionStatus;
    verificationRequired?: {
      email: boolean;
      phone: boolean;
      preferredMethod: ContactMethod;
    };
  };
  message?: string;
}

/**
 * Payload when requesting an OTP (registration, reset, login).
 */
export interface OTPVerificationData {
  userId: string;
  otpCode: string;
  purpose: "registration" | "reset_password" | "login";
}

/**
 * Response for OTP verification calls.
 */
export interface OTPVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    accountCompletion?: AccountCompletionStatus;
    token?: string;
    session?: SessionData;
    tempToken?: string;
    verificationStatus?: {
      email: boolean;
      phone: boolean;
      nextStep?: string;
    };
  };
  error?: {
    code: string;
    details?: any;
  };
}

/**
 * Data shape for resending an OTP.
 */
export interface OTPResendData {
  userId: string;
  deliveryMethod: ContactMethod;
  email?: string;
  phoneNumber?: string;
  purpose: "registration" | "reset_password" | "login";
}

/**
 * Generic API wrapper type.
 */
export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  cooldownPeriod?: number;
    returnUrl?: string;
}

/**
 * The KYC document stored in the database and returned by the GET endpoints.
 */
export interface KYCDocument {
  document_id: string;
  user_id: string;
  document_type: string;
  document_country: string;
  verification_status: DocumentVerificationStatus;
  blob_storage_url: string;
  file_size?: number;
  file_type?: string;
  uploaded_at: Date;
  verified_at?: Date;
  verification_notes?: string;
}

/**
 * Response when the front end uploads a KYC document:
 * Matches AuthController.uploadDocument → status 201 JSON.
 */
export interface KYCUploadResponse {
  success: boolean;
  message: string;
  document: KYCDocument;
}

/**
 * Response when the front end asks for a single document’s status:
 * Matches AuthController.getDocumentStatus → JSON.
 */
export interface KYCStatusResponse {
  success: boolean;
  document: {
    status: DocumentVerificationStatus;
    type: string;
    verifiedAt: Date | null;
    notes?: string;
  };
  message: string;
}

/**
 * Response when the front end wants all KYC documents for the user:
 * Matches AuthController.getUserDocuments → JSON.
 */
export interface KYCListResponse {
  success: boolean;
  message: string;
  documents: Array<{
    id: string;
    type: string;
    status: DocumentVerificationStatus;
    uploadedAt: Date;
    verifiedAt?: Date;
  }>;
}

/**
 * Used throughout the app whenever an authenticated call fails with a special error.
 */
export interface AuthError extends Error {
  code?: string;
  requiresVerification?: boolean;
  userId?: string;
  preferredContactMethod?: ContactMethod;
}

/**
 * Shape returned when initiating a password reset.
 */
export interface PasswordResetInitiationResponse {
  success: boolean;
  message: string;
  userId: string;
  method: ContactMethod;
  destination: string;
}

/**
 * State kept during a password reset flow.
 */
export interface PasswordResetState {
  email: string;
  userId: string;
  method: ContactMethod;
  destination: string;
  attempts: number;
  lastAttempt?: Date;
  cooldownPeriod?: number;
  expiresAt?: Date;
  verificationStatus?: {
    completed: boolean;
    timestamp?: Date;
  };
}

/**
 * Shape returned when completing a password reset.
 */
export interface PasswordResetCompletionResponse {
  success: boolean;
  message: string;
}

/**
 * Session info for display and reauthentication logic.
 */
export interface SessionInfo extends SessionData {
  isValid: boolean;
  requiresReauth?: boolean;
  lastActivity?: Date;
  deviceInfo?: {
    id: string;
    browser: string;
    platform: string;
    lastUsed: Date;
  };
}

/**
 * Used for rate‐limiting OTP or login attempts.
 */
export interface RateLimitInfo {
  attempts: number;
  lastAttempt: Date;
  cooldownPeriod: number;
  remainingTime?: number;
  maxAttempts: number;
}

/**
 * Captures ongoing password reset form state.
 */
export interface PasswordResetFormState {
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Captures “where we are” in a multi‐step verification flow.
 */
export interface VerificationState {
  user_id: string;
  email: string;
  method: ContactMethod;
  destination: string;
  attempts: number;
  lastAttempt?: Date;
  cooldownPeriod?: number;
  returnUrl?: string;
}

/**
 * Full context returned by useAuth() hook.
 */
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  verifyOTP: (data: OTPVerificationData) => Promise<void>;
  resendOTP: (userId: string, method?: ContactMethod) => Promise<void>;
  initiatePasswordReset: (email: string) => Promise<void>;
  completePasswordReset: (
    userId: string,
    otpCode: string,
    newPassword: string
  ) => Promise<void>;
  getCurrentUser: () => Promise<UserProfile>;
  uploadDocument: (
    file: File,
    documentType: string,
    documentCountry: string
  ) => Promise<KYCDocument>;
  getDocumentStatus: (
    documentId: string
  ) => Promise<KYCStatusResponse["document"]>;
  getUserDocuments: () => Promise<KYCDocument[]>;
  verificationData: {
    user_id?: string;
    email?: string;
    method?: ContactMethod;
  } | null;
  checkAuth: () => Promise<boolean>;
  verificationState: VerificationState | null;
  setVerificationState: (state: VerificationState | null) => void;
  handleVerificationRedirect: (data: {
    user_id: string;
    email: string;
    method?: ContactMethod;
    returnUrl?: string;
  }) => void;
  checkVerificationStatus: () => Promise<{
    email: boolean;
    phone: boolean;
    required: boolean;
  }>;
}

  export interface AccountCompletionStatus {
    personalInfoComplete: boolean;
    identityVerified: boolean;
    bankingDetailsComplete: boolean;
    investmentPreferencesSet: boolean;
    overallCompletion: number;
    basicVerified: boolean;
    documentsSubmitted: boolean;
    accountComplete: boolean;
    requiresVerification?: boolean;
    userId?: string;
    preferredContactMethod?: ContactMethod;
    statusCode?: number;
    isNetworkError?: boolean;
    isServerError?: boolean;
    isClientError?: boolean;
    errorDetails?: any;
  }


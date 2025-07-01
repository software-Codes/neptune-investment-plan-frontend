/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/type.ts

declare module '@/types/type' {
  export enum ContactMethod {
    EMAIL = 'email',
    PHONE = 'phone',
    SMS = 'sms'
  }

  export enum AccountStatus {
    PENDING = 'pending',
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    DEACTIVATED = 'deactivated'
  }

  export enum DocumentVerificationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    NOT_SUBMITTED = 'not_submitted'
  }

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

  export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role?: string;
  }

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
    completePasswordReset: (userId: string, otpCode: string, newPassword: string) => Promise<void>;
    getCurrentUser: () => Promise<UserProfile>;
    uploadDocument: (file: File, documentType: string, documentCountry: string) => Promise<KYCDocument>;
    getDocumentStatus: (documentId: string) => Promise<KYCDocument>;
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

  export interface RegistrationData {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    preferredContactMethod: ContactMethod;
  }

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

  export interface SessionData {
    sessionId: string;
    expiresAt: Date;
  }

  export interface UserProfile extends User {
    wallets: Wallet[];
    accountCompletion: AccountCompletionStatus;
  }

  export interface Wallet {
    wallet_id: string;
    user_id: string;
    wallet_type: 'account' | 'trading' | 'referral';
    balance: string;
    locked_balance?: string;
    created_at: Date;
    updated_at: Date;
  }

  export interface AccountCompletionStatus {
    basicVerified: boolean;
    documentsSubmitted: boolean;
    accountComplete: boolean;
    requiredDocuments: string[];
    submittedDocuments: string[];
    completionPercentage: number;
  }

  export interface VerificationResponse {
    success: boolean;
    message: string;
    data?: {
      user_id: string;
      full_name: string;
      email: string;
      phone_number: string;
      preferred_contact_method: ContactMethod;
      account_status: AccountStatus;
      token?: string;
      user?: User;
    };
  }

  export interface AuthError extends Error {
    code?: string;
    requiresVerification?: boolean;
    userId?: string;
    preferredContactMethod?: ContactMethod;
  }

  export interface APIResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
  }

  export interface OTPVerificationData {
    userId: string;
    otpCode: string;
    purpose: 'registration' | 'reset_password' | 'login';
  }

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

  export interface OTPResendData {
    userId: string;
    deliveryMethod: ContactMethod;
    email?: string;
    phoneNumber?: string;
    purpose: 'registration' | 'reset_password' | 'login';
  }

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

  export interface PasswordResetInitiationResponse {
    success: boolean;
    message: string;
    userId: string;
    method: ContactMethod;
    destination: string;
  }

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

  export interface RateLimitInfo {
    attempts: number;
    lastAttempt: Date;
    cooldownPeriod: number;
    remainingTime?: number;
    maxAttempts: number;
  }

  export interface PasswordResetFormState {
    otpCode: string;
    newPassword: string;
    confirmPassword: string;
  }

  export interface PasswordResetCompletionResponse {
    success: boolean;
    message: string;
  }

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
}
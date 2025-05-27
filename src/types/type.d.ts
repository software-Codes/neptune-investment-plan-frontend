/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/type.ts

export enum ContactMethod {
  EMAIL = 'email',
  PHONE = 'phone'
}

export enum AccountStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended'
}

export enum DocumentVerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface User {
  userId: string;
  email: string;
  full_name: string;
  phone_number: string;
  preferred_contact_method: ContactMethod;
  account_status: AccountStatus;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: Date;
  updated_at?: Date;
  last_login_at?: Date;
  role?: string;
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
  uploadDocument: (file: File, documentType: string, documentCountry: string) => Promise<void>;
  getDocumentStatus: (documentId: string) => Promise<KYCDocument>;
  getUserDocuments: () => Promise<KYCDocument[]>;
  verificationData: {
    userId?: string;
    email?: string;
    method?: ContactMethod;
  } | null;
  checkAuth: () => Promise<boolean>;
}

export interface RegistrationData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  preferredContactMethod: 'email' | 'phone';
}

export interface RegistrationResponse {
  success: boolean;
  user: {
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    preferredContactMethod: 'email' | 'phone';
    accountStatus: string;
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
  };
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
  currency: string;
  balance: number;
  status: 'active' | 'frozen' | 'closed';
  created_at: Date;
  updated_at: Date;
}

export interface AccountCompletionStatus {
  personal_info_complete: boolean;
  identity_verified: boolean;
  banking_details_complete: boolean;
  investment_preferences_set: boolean;
  overall_completion: number;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  user: User;
  requires_verification: boolean;
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
  };
}

export interface OTPResendData {
  userId: string;
  deliveryMethod: ContactMethod;
  email?: string;
}

export interface KYCDocument {
  document_id: string;
  user_id: string;
  document_type: string;
  document_country: string;
  verification_status: DocumentVerificationStatus;
  blob_storage_url: string;
  uploaded_at: Date;
  verified_at?: Date;
  verification_notes?: string;
}

setUser({
  userId: userData.userId,
  email: userData.email,
  full_name: userData.full_name,
  phone_number: userData.phone_number,
  preferred_contact_method: userData.preferred_contact_method,
  account_status: userData.account_status,
  email_verified: userData.email_verified,
  phone_verified: userData.phone_verified,
  created_at: userData.created_at,
  role: userData.account_status === 'active' ? 'user' : 'pending',
});

export interface PasswordResetInitiationResponse {
  success: boolean;
  message: string;
  userId: string;
  method: 'email' | 'phone';
  destination: string;
}
export interface PasswordResetState {
  email: string;
  userId: string;
  method: 'email' | 'phone';
  destination: string;
  attempts: number;
  lastAttempt?: Date;
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
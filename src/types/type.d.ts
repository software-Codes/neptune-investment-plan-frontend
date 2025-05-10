export interface User {
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
  checkAuth: () => Promise<boolean>;
  register: (data: RegistrationData) => Promise<void>;
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
    preferredContactMethod: string;
    accountStatus: string;
  };
  message: string;
}
export interface VerificationResponse {
  userId: string;
  email: string;
  fullName: string;
  accountStatus: string;
}
export interface LoginResponse {
  success: boolean;
  token: string;
  session: {
      sessionId: string;
      expiresAt: string;
  };
}
export interface AuthError extends Error {
  requiresVerification?: boolean;
}
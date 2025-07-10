import {
  RegisterCredentials,
  LoginCredentials,
  ProfileUpdateData,
} from "@/types/admin/admin.types";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class AdminValidationService {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MIN_PASSWORD_LENGTH = 8;
  private static readonly MIN_NAME_LENGTH = 2;

  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];

    if (!email || !email.trim()) {
      errors.push("Email is required");
    } else if (!this.EMAIL_REGEX.test(email.trim())) {
      errors.push("Please enter a valid email address");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validatePassword(
    password: string,
    fieldName = "Password"
  ): ValidationResult {
    const errors: string[] = [];

    if (!password || !password.trim()) {
      errors.push(`${fieldName} is required`);
    } else if (password.length < this.MIN_PASSWORD_LENGTH) {
      errors.push(
        `${fieldName} must be at least ${this.MIN_PASSWORD_LENGTH} characters long`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateFullName(fullName: string): ValidationResult {
    const errors: string[] = [];

    if (!fullName || !fullName.trim()) {
      errors.push("Full name is required");
    } else if (fullName.trim().length < this.MIN_NAME_LENGTH) {
      errors.push(
        `Full name must be at least ${this.MIN_NAME_LENGTH} characters long`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateLoginCredentials(
    credentials: LoginCredentials
  ): ValidationResult {
    const errors: string[] = [];

    const emailValidation = this.validateEmail(credentials.email);
    const passwordValidation = this.validatePassword(credentials.password);

    errors.push(...emailValidation.errors);
    errors.push(...passwordValidation.errors);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateRegisterCredentials(
    credentials: RegisterCredentials
  ): ValidationResult {
    const errors: string[] = [];

    const emailValidation = this.validateEmail(credentials.email);
    const passwordValidation = this.validatePassword(credentials.password);
    const nameValidation = this.validateFullName(credentials.fullName);

    errors.push(...emailValidation.errors);
    errors.push(...passwordValidation.errors);
    errors.push(...nameValidation.errors);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateProfileUpdate(data: ProfileUpdateData): ValidationResult {
    const errors: string[] = [];

    if (data.fullName !== undefined) {
      const nameValidation = this.validateFullName(data.fullName);
      errors.push(...nameValidation.errors);
    }

    if (data.currentPassword !== undefined && data.newPassword !== undefined) {
      const currentPasswordValidation = this.validatePassword(
        data.currentPassword,
        "Current password"
      );
      const newPasswordValidation = this.validatePassword(
        data.newPassword,
        "New password"
      );

      errors.push(...currentPasswordValidation.errors);
      errors.push(...newPasswordValidation.errors);
    } else if (
      data.currentPassword !== undefined ||
      data.newPassword !== undefined
    ) {
      errors.push(
        "Both current password and new password are required to change password"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

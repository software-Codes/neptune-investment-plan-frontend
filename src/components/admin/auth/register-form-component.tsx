"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { AdminRegistrationRequest } from "@/types/admin/admin.types";
import { AdminValidationService } from "@/lib/utils/api/admin/validate-admin-forms";
import { adminApiClient } from "@/app/admin/api/auth-api/auth-admin-api-client";
import { FormErrorAlert } from "../custom-form.error";
import { FormInput } from "../custom-form-input";
import { FormSubmitButton } from "../custom-button";

// ===== INTERFACES =====
interface RegisterFormProps extends React.ComponentProps<"form"> {
  onSuccess?: () => void;
}

interface RegisterFormState {
  credentials: AdminRegistrationRequest;
  loading: boolean;
  error: string | null;
}

// ===== CONSTANTS =====
const INITIAL_STATE: RegisterFormState = {
  credentials: {
    fullName: "",
    email: "",
    password: "",
    role: "admin",
  },
  loading: false,
  error: null,
};

const PASSWORD_REQUIREMENTS = [
  "At least 8 characters long",
  "Contains uppercase letter",
  "Contains lowercase letter",
  "Contains number",
  "Contains special character",
];

// ===== FORM VALIDATION HOOK =====
const useFormValidation = () => {
  const validateCredentials = useCallback(
    (credentials: AdminRegistrationRequest) => {
      const validation =
        AdminValidationService.validateRegisterCredentials(credentials);
      return {
        isValid: validation.isValid,
        errorMessage: validation.errors[0] || null,
      };
    },
    []
  );

  return { validateCredentials };
};

// ===== PASSWORD STRENGTH CHECKER =====
const usePasswordStrength = () => {
  const getPasswordStrength = useCallback((password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const passed = Object.values(checks).filter(Boolean).length;
    const strength = passed <= 2 ? "weak" : passed <= 4 ? "medium" : "strong";

    return { checks, strength, score: passed };
  }, []);

  return { getPasswordStrength };
};

// ===== MAIN COMPONENT =====
export function RegisterForm({
  className,
  onSuccess,
  ...props
}: RegisterFormProps) {
  const router = useRouter();
  const { validateCredentials } = useFormValidation();
  const { getPasswordStrength } = usePasswordStrength();
  const [state, setState] = useState<RegisterFormState>(INITIAL_STATE);

  // Get password strength for current password
  const passwordStrength = getPasswordStrength(state.credentials.password);

  // ===== HANDLERS =====
  const handleInputChange = useCallback(
    (field: keyof AdminRegistrationRequest) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setState((prev) => ({
          ...prev,
          credentials: {
            ...prev.credentials,
            [field]: e.target.value,
          },
          // Clear error when user starts typing
          error: prev.error ? null : prev.error,
        }));
      },
    []
  );

  const handleSuccess = useCallback(() => {
    toast.success("Account Created Successfully!", {
      description: "Please check your email and then sign in to your account.",
      duration: 5000,
    });

    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/admin/auth/login");
    }
  }, [onSuccess, router]);

  const handleError = useCallback((error: Error) => {
    const errorMessage = error.message;

    setState((prev) => ({
      ...prev,
      loading: false,
      error: errorMessage,
    }));

    toast.error("Registration Failed", {
      description: errorMessage,
      duration: 5000,
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form
      const { isValid, errorMessage } = validateCredentials(state.credentials);
      if (!isValid) {
        setState((prev) => ({ ...prev, error: errorMessage }));
        toast.error("Validation Error", {
          description: errorMessage,
          duration: 4000,
        });
        return;
      }

      // Check password strength
      if (passwordStrength.score < 4) {
        const message = "Please ensure your password meets all requirements";
        setState((prev) => ({ ...prev, error: message }));
        toast.error("Weak Password", {
          description: message,
          duration: 4000,
        });
        return;
      }

      // Set loading state
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        await adminApiClient.register(state.credentials);
        handleSuccess();
      } catch (error) {
        handleError(
          error instanceof Error ? error : new Error("Registration failed")
        );
      }
    },
    [
      state.credentials,
      validateCredentials,
      passwordStrength.score,
      handleSuccess,
      handleError,
    ]
  );

  // Check if form is valid for submission
  const isFormValid =
    state.credentials.fullName.trim() &&
    state.credentials.email.trim() &&
    state.credentials.password.trim() &&
    passwordStrength.score >= 4;

  // ===== RENDER =====
  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Create Admin Account
        </h1>
        <p className="text-sm text-muted-foreground">
          Fill in your details to create a new admin account
        </p>
      </div>

      {/* Error Alert */}
      <FormErrorAlert error={state.error} />

      {/* Form Fields */}
      <div className="grid gap-4">
        <FormInput
          label="Full Name"
          type="text"
          value={state.credentials.fullName}
          onChange={handleInputChange("fullName")}
          placeholder="John Doe"
          disabled={state.loading}
          required
          autoComplete="name"
          helperText="Enter your full name as it should appear in the system"
        />

        <FormInput
          label="Email Address"
          type="email"
          value={state.credentials.email}
          onChange={handleInputChange("email")}
          placeholder="admin@example.com"
          disabled={state.loading}
          required
          autoComplete="email"
          helperText="This will be your login email address"
        />

        <div className="space-y-2">
          <FormInput
            label="Password"
            isPassword
            showPasswordToggle
            value={state.credentials.password}
            onChange={handleInputChange("password")}
            placeholder="Create a strong password"
            disabled={state.loading}
            required
            autoComplete="new-password"
          />

          {/* Password Strength Indicator */}
          {state.credentials.password && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-colors",
                        passwordStrength.score >= level
                          ? passwordStrength.strength === "weak"
                            ? "bg-red-500"
                            : passwordStrength.strength === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                          : "bg-gray-200"
                      )}
                    />
                  ))}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium capitalize",
                    passwordStrength.strength === "weak" && "text-red-600",
                    passwordStrength.strength === "medium" && "text-yellow-600",
                    passwordStrength.strength === "strong" && "text-green-600"
                  )}
                >
                  {passwordStrength.strength}
                </span>
              </div>

              {/* Password Requirements Checklist */}
              <div className="text-xs space-y-1">
                <p className="font-medium text-muted-foreground">
                  Password must contain:
                </p>
                <ul className="space-y-1">
                  <li
                    className={cn(
                      "flex items-center gap-2",
                      passwordStrength.checks.length
                        ? "text-green-600"
                        : "text-muted-foreground"
                    )}
                  >
                    <span className="text-[10px]">
                      {passwordStrength.checks.length ? "✓" : "○"}
                    </span>
                    At least 8 characters
                  </li>
                  <li
                    className={cn(
                      "flex items-center gap-2",
                      passwordStrength.checks.uppercase
                        ? "text-green-600"
                        : "text-muted-foreground"
                    )}
                  >
                    <span className="text-[10px]">
                      {passwordStrength.checks.uppercase ? "✓" : "○"}
                    </span>
                    Uppercase letter (A-Z)
                  </li>
                  <li
                    className={cn(
                      "flex items-center gap-2",
                      passwordStrength.checks.lowercase
                        ? "text-green-600"
                        : "text-muted-foreground"
                    )}
                  >
                    <span className="text-[10px]">
                      {passwordStrength.checks.lowercase ? "✓" : "○"}
                    </span>
                    Lowercase letter (a-z)
                  </li>
                  <li
                    className={cn(
                      "flex items-center gap-2",
                      passwordStrength.checks.number
                        ? "text-green-600"
                        : "text-muted-foreground"
                    )}
                  >
                    <span className="text-[10px]">
                      {passwordStrength.checks.number ? "✓" : "○"}
                    </span>
                    Number (0-9)
                  </li>
                  <li
                    className={cn(
                      "flex items-center gap-2",
                      passwordStrength.checks.special
                        ? "text-green-600"
                        : "text-muted-foreground"
                    )}
                  >
                    <span className="text-[10px]">
                      {passwordStrength.checks.special ? "✓" : "○"}
                    </span>
                    Special character (!@#$%^&*)
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <FormSubmitButton
          loading={state.loading}
          loadingText="Creating Account..."
          disabled={!isFormValid}
        >
          Create Account
        </FormSubmitButton>
      </div>

      {/* Footer Links */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/admin/auth/login"
            className="text-primary hover:underline font-medium transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </form>
  );
}

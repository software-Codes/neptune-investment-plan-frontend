"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { RegisterCredentials } from "@/types/admin/admin.types";
import { toast } from "sonner";
import { AdminValidationService } from "@/lib/utils/api/admin/validate-admin-forms";
import { adminApiClient } from "@/app/admin/api/auth-api/auth-admin-api-client";
import { FormErrorAlert } from "../custom-form.error";
import { FormInput } from "../custom-form-input";
import { FormSubmitButton } from "../custom-button";


interface RegisterFormProps extends React.ComponentProps<"form"> {
    onSuccess?: () => void;
}

export function RegisterForm({ className, onSuccess, ...props }: RegisterFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<RegisterCredentials>({
        fullName: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (field: keyof RegisterCredentials) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value,
        }));

        // Clear error when user starts typing
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        const validation = AdminValidationService.validateRegisterCredentials(formData);
        if (!validation.isValid) {
            setError(validation.errors[0]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await adminApiClient.register(formData);

            toast.success("Account created successfully! Please login.");

            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/admin/auth/login");
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Registration failed";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={cn("flex flex-col gap-6", className)}
            {...props}
        >
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create Admin Account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Enter your details to create an admin account
                </p>
            </div>

            <FormErrorAlert error={error} />

            <div className="grid gap-4">
                <FormInput
                    label="Full Name"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange("fullName")}
                    placeholder="John Doe"
                    disabled={loading}
                    required
                />

                <FormInput
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    placeholder="admin@example.com"
                    disabled={loading}
                    required
                />

                <FormInput
                    label="Password"
                    isPassword
                    showPasswordToggle
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    placeholder="Enter your password"
                    disabled={loading}
                    required
                    helperText="Must be at least 8 characters with uppercase, lowercase, and number"
                />

                <FormSubmitButton
                    loading={loading}
                    loadingText="Creating Account..."
                >
                    Create Account
                </FormSubmitButton>
            </div>

            <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/admin/auth/login" className="underline text-primary">
                    Sign In
                </Link>
            </div>
        </form>
    );
}
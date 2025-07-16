"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { LoginCredentials } from "@/types/admin/admin.types";
import { toast } from "sonner";
import { AdminValidationService } from "@/lib/utils/api/admin/validate-admin-forms";
import { adminApiClient } from "@/app/admin/api/auth-api/auth-admin-api-client";
import { FormErrorAlert } from "../custom-form.error";
import { FormInput } from "../custom-form-input";
import { FormSubmitButton } from "../custom-button";


interface LoginFormProps extends React.ComponentProps<"form"> {
    onSuccess?: () => void;
}

export function LoginForm({ className, onSuccess, ...props }: LoginFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<LoginCredentials>({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (field: keyof LoginCredentials) => (
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
        const validation = AdminValidationService.validateLoginCredentials(formData);
        if (!validation.isValid) {
            setError(validation.errors[0]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const admin = await adminApiClient.login(formData);

            toast.success(`Welcome back, ${admin.fullName}!`);

            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/admin/dashboard");
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Login failed";
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
            <div className="text-center">
                <h1 className="text-2xl font-bold">Login to your account</h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email below to login to your account
                </p>
            </div>

            <FormErrorAlert error={error} />

            <div className="grid gap-4">
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
                />

                <FormSubmitButton
                    loading={loading}
                    loadingText="Logging in..."
                >
                    Login
                </FormSubmitButton>
            </div>

            <p className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/admin/auth/register" className="underline text-primary">
                    Sign up
                </Link>

                
            </p>
             <Link href="/admin/auth/forgot-password"  className="text-center text-sm mt-0 mb-0 underline">
                    Forgot password?
                </Link>
        </form>
    );
}
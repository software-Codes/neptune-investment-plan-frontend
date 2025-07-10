import React, { forwardRef } from "react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

interface FormInputProps extends React.ComponentProps<typeof Input> {
    label: string;
    error?: string;
    helperText?: string;
    showPasswordToggle?: boolean;
    isPassword?: boolean;
    rightElement?: React.ReactNode;
}


export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    (
        {
            label,
            error,
            helperText,
            showPasswordToggle = false,
            isPassword = false,
            rightElement,
            className,
            id,
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

        const togglePasswordVisibility = () => {
            setShowPassword(prev => !prev);
        };

        const inputType = React.useMemo(() => {
            if (isPassword && showPasswordToggle) {
                return showPassword ? "text" : "password";
            }
            return props.type || "text";
        }, [isPassword, showPasswordToggle, showPassword, props.type]);

        return (
            <div className="grid gap-2">
                <Label htmlFor={inputId} className="text-sm font-medium">
                    {label}
                </Label>

                <div className="relative">
                    <Input
                        {...props}
                        ref={ref}
                        id={inputId}
                        type={inputType}
                        className={cn(
                            error && "border-destructive focus-visible:ring-destructive",
                            className
                        )}
                    />

                    {/* Password toggle button */}
                    {showPasswordToggle && isPassword && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                            onClick={togglePasswordVisibility}
                            disabled={props.disabled}
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                        </Button>
                    )}

                    {/* Custom right element */}
                    {rightElement && !showPasswordToggle && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            {rightElement}
                        </div>
                    )}
                </div>

                {/* Helper text or error message */}
                {(helperText || error) && (
                    <p className={cn(
                        "text-xs",
                        error ? "text-destructive" : "text-muted-foreground"
                    )}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

FormInput.displayName = "FormInput";
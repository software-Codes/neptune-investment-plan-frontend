
import React, { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


interface FormSubmitButtonProps extends React.ComponentProps<typeof Button> {
    loading?: boolean;
    loadingText?: string;
    children: React.ReactNode;
    loadingIcon?: React.ReactNode;
}


export const FormSubmitButton = forwardRef<HTMLButtonElement, FormSubmitButtonProps>(
    (
        {
            loading = false,
            loadingText,
            children,
            loadingIcon,
            className,
            disabled,
            ...props
        },
        ref
    ) => {
        const defaultLoadingIcon = (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        );

        const isDisabled = loading || disabled;

        return (
            <Button
                {...props}
                ref={ref}
                type="submit"
                disabled={isDisabled}
                className={cn("w-full", className)}
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        {loadingIcon || defaultLoadingIcon}
                        {loadingText || "Please wait..."}
                    </div>
                ) : (
                    children
                )}
            </Button>
        );
    }
);

FormSubmitButton.displayName = "FormSubmitButton";
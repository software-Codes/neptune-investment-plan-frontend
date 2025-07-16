import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface FormErrorAlertProps {
    error: string | null;
    className?: string;
}

export const FormErrorAlert = ({ error, className }: FormErrorAlertProps) => {
    if (!error) return null;

    return (
        <Alert variant="destructive" className={className}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
};

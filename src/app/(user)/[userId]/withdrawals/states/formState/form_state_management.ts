import { useState } from "react";
import { notificationService } from "../../services/notifications.service";

//reusable form state management 
export const useFormState = <T>(initialState: T, validator?: (data: T) => string[]) => {
    const [formData, setFormData] = useState<T>(initialState);
    const [errors, setErrors] = useState<string[]>([]);
    const updateField = (field: keyof T, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (validator) {
            setErrors(validator({ ...formData, [field]: value }));
        }
    };

    return { formData, errors, updateField, setFormData, setErrors };
};

//Reusable API error handling
export const useApiError = () => {
    const [error, setError] = useState<string | null>(null);
    const handleError = (err: any) => {
        const message = err.message || ' An unexpected error ovccurred'
        setError(message);
        notificationService.getInstance().error(message);
    };
    const clearError = () => setError(null);
    return { error, handleError, clearError }
}

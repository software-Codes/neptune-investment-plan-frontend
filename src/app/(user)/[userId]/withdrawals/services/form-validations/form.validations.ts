//validation pipeline pattern

import { WithdrawalForm } from "@/types/withdrawals/withdrawal.types";

interface validationRule<T> {
    validate: (value: T) => boolean;
    message: string;
}

export class WithdrawalValidator {
    private rules: Map<keyof WithdrawalForm, validationRule<any>[]> = new Map();

    constructor() {
        this.setupRules();
    }

    private setupRules() {
        this.rules.set("amount", [
            { validate: (v) => v >= 10, message: "Minimum withdrawal is $10" },
            { validate: (v) => v <= 10000, message: "Maximum withdrawal is $10,000" },
        ]);
        this.rules.set("receiving_address", [
            {
                validate: (v) => /^[a-zA-Z0-9]{26,35}$/.test(v),
                message: "Invalid Binance address format",
            },
        ]);
    }
    validate(field: keyof WithdrawalForm, value: any): string[] {
        const fieldRules = this.rules.get(field) || [];
        return fieldRules
            .filter((rule) => !rule.validate(value))
            .map((rule) => rule.message);
    }
}
/*
Why Validation Pipeline:

Extensibility: Easy to add new validation rules
Reusability: Can be used across different forms
Performance: Only validates changed fields
Type Safety: Ensures validation matches form structure
*/

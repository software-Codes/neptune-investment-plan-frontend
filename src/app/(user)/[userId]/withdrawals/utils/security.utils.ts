import { Input } from "@/components/ui/input";

export class SecurityUtils {
    // Sanitize user inputs
    static sanitizeInput(input: string): string {
        return input
            .replace(/[<>]/g, '') // Remove HTML tags
            .replace(/javascript:/gi, '') // Remove JS protocols
            .trim();
    }
    // Validate Binance address format
    static validateBinanceAddress(address: string): boolean {
        const sanitized = this.sanitizeInput(address);
        return /^[a-zA-Z0-9]{26,35}$/.test(sanitized);
    }
    // Amount validation with precision
    static validateAmount(amount: number): boolean {
        return amount > 0 &&
            amount >= 10 &&
            amount <= 1000000 &&
            Number.isFinite(amount);
    }
}
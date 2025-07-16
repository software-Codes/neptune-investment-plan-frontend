'use client'
import { useState, useEffect } from "react"

interface PasswordStrengthProps {
    password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
    const [strength, setStrength] = useState(0);
    const [feedback, setFeedback] = useState('');
    useEffect(() => {
        let score = 0;
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            numbers: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        };

        score = Object.values(checks).filter(Boolean).length;
        setStrength(score);

        const missing = Object.entries(checks)
            .filter(([_, passed]) => !passed)
            .map(([check]) => {
                switch (check) {
                    case 'length': return 'at least 8 characters';
                    case 'uppercase': return 'uppercase letter';
                    case 'lowercase': return 'lowercase letter';
                    case 'numbers': return 'number';
                    case 'special': return 'special character';
                    default: return '';
                }
            });

        setFeedback(missing.length ? `Add ${missing.join(', ')}` : 'Strong password!');
    }, [password]);
    return (
        <div className="mt-2 space-y-2">
            <div className="flex gap-1 h-1">
                {[1, 2, 3, 4, 5].map((level) => (
                    <div
                        key={level}
                        className={`flex-1 rounded-full transition-colors ${level <= strength
                                ? strength < 3
                                    ? 'bg-red-500'
                                    : strength < 4
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                    />
                ))}
            </div>
            <p className={`text-xs ${strength < 3 ? 'text-red-500' :
                    strength < 4 ? 'text-yellow-500' :
                        'text-green-500'
                }`}>
                {feedback}
            </p>
        </div>

    );
}
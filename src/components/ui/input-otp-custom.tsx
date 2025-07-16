// components/ui/input-otp-custom.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface OTPInputProps {
  value?: string[]
  onChange?: (digits: string[]) => void
  onComplete?: (otp: string) => void
  length?: number
  disabled?: boolean
  className?: string
  autoFocus?: boolean
}

export function OTPInput({
  value = [],
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  className,
  autoFocus = true,
}: OTPInputProps) {
  const [digits, setDigits] = useState<string[]>(
    value.length > 0 ? value : Array(length).fill("")
  )
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  // Update internal state when value prop changes
  useEffect(() => {
    if (value.length > 0 && JSON.stringify(value) !== JSON.stringify(digits)) {
      setDigits(value)
    }
  }, [value, digits])

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const handleChange = (digit: string, index: number) => {
    if (disabled) return

    // Only allow numeric input
    const numericValue = digit.replace(/\D/g, "")
    if (numericValue.length > 1) return

    const newDigits = [...digits]
    newDigits[index] = numericValue

    setDigits(newDigits)
    onChange?.(newDigits)

    // Auto-focus next input
    if (numericValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Call onComplete when all digits are filled
    const otpValue = newDigits.join("")
    if (otpValue.length === length && onComplete) {
      onComplete(otpValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (disabled) return

    if (e.key === "Backspace") {
      e.preventDefault()
      const newDigits = [...digits]

      if (digits[index]) {
        // Clear current digit
        newDigits[index] = ""
      } else if (index > 0) {
        // Move to previous input and clear it
        inputRefs.current[index - 1]?.focus()
        newDigits[index - 1] = ""
      }

      setDigits(newDigits)
      onChange?.(newDigits)
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return

    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain")
    const numericData = pastedData.replace(/\D/g, "").slice(0, length)
    
    if (numericData) {
      const newDigits = Array(length).fill("")
      for (let i = 0; i < Math.min(numericData.length, length); i++) {
        newDigits[i] = numericData[i]
      }
      
      setDigits(newDigits)
      onChange?.(newDigits)
      
      // Focus the next empty input or the last filled input
      const nextEmptyIndex = newDigits.findIndex(d => !d)
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(numericData.length - 1, length - 1)
      inputRefs.current[focusIndex]?.focus()
      
      // Call onComplete if all digits are filled
      const otpValue = newDigits.join("")
      if (otpValue.length === length && onComplete) {
        onComplete(otpValue)
      }
    }
  }

  return (
    <div className={cn("flex justify-center gap-2", className)}>
      {Array.from({ length }, (_, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[index] || ""}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={index === 0 ? handlePaste : undefined}
          className={cn(
            "w-12 h-12 text-center text-xl font-semibold",
            "border-2 rounded-lg transition-all duration-200",
            "focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
            "border-emerald-200 bg-white",
            digits[index] && "border-emerald-400 bg-emerald-50",
            disabled && "opacity-50 cursor-not-allowed bg-gray-50",
            "hover:border-emerald-300 focus:outline-none"
          )}
          disabled={disabled}
        />
      ))}
    </div>
  )
}

export default OTPInput
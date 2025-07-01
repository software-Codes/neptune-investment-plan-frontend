"use client"
import React from 'react'

interface WelcomeGreetingsProps {
    fullName?: string
}

/**
 * Displays a personalized welcome message.
 * Responsive text size and spacing for various screen sizes.
 */
export default function WelcomeGreetings({ fullName }: WelcomeGreetingsProps) {
    return (
        <div className="w-full bg-gradient-to-r from-green-600 to-yellow-400 p-6 rounded-2xl text-white text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                Welcome back, {fullName}!
            </h2>
            <p className="mt-2 text-sm sm:text-base md:text-lg opacity-90">
                Glad to see you again at Neptune.
            </p>
        </div>
    )
}


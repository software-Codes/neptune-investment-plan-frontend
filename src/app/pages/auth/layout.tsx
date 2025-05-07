'use client';

import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Section with Enhanced Green Gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-green-500 to-teal-500 relative overflow-hidden">
        {/* Enhanced pattern overlay */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0,_transparent_100%)]"></div>
        
        {/* Main Content Container */}
        <div className="flex flex-col items-center justify-between w-full h-full p-8 relative z-10">
          {/* Logo and Welcome Text */}
          <div className="flex flex-col items-center pt-12">
            <div className="text-6xl font-bold text-white mb-4">
              <span className="text-8xl text-emerald-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">N</span>
              <span className="tracking-wide drop-shadow-lg">eptune</span>
            </div>
            <p className="text-emerald-50 text-center max-w-md text-lg mt-6">
              Your complete solution for workforce management and scheduling
            </p>
          </div>

          {/* Quote and Footer Section */}
          <div className="w-full text-center">
            <blockquote className="mb-8">
              <p className="text-emerald-50 italic text-lg mb-2">
                &quot;The best investment you can make is in yourself.&ldquo;
              </p>
              <footer className="text-emerald-200 text-sm">
                - Warren Buffett
              </footer>
            </blockquote>
            <div className="text-emerald-200/80 text-sm">
              Neptune © 2025. All rights reserved.
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-b from-emerald-50/40 to-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="text-4xl font-bold text-emerald-700 mb-4">
              <span className="text-6xl text-emerald-600">N</span>
              <span className="tracking-wide">eptune</span>
            </div>
          </div>

          {/* Auth Form Content with Enhanced Styling */}
          <div className="bg-white/80 p-8 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] 
               backdrop-blur-sm border border-emerald-100/30 
               hover:shadow-[0_8px_35px_rgb(0,0,0,0.12)] transition-shadow duration-300">
            {children}
          </div>

          {/* Mobile Footer */}
          <div className="mt-8 text-center text-emerald-700/60 text-sm lg:hidden">
            Neptune © 2025. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
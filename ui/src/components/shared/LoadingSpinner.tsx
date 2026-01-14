"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
   message?: string;
   className?: string;
   size?: "sm" | "md" | "lg";
}

const sizeClasses = {
   sm: "h-6 w-6",
   md: "h-10 w-10",
   lg: "h-16 w-16",
};

/**
 * A reusable loading spinner component with optional message.
 */
export function LoadingSpinner({
   message = "Loading...",
   className = "",
   size = "md",
}: LoadingSpinnerProps) {
   return (
      <div
         className={`flex flex-col items-center justify-center gap-4 p-8 ${className}`}
      >
         <div className="relative">
            <div
               className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 animate-pulse`}
            />
            <Loader2
               className={`${sizeClasses[size]} text-purple-400 animate-spin absolute top-0 left-0`}
            />
         </div>
         {message && <p className="text-slate-300 text-sm">{message}</p>}
      </div>
   );
}

/**
 * Table loading skeleton for lists/tables.
 */
export function TableLoadingSkeleton({ rows = 5 }: { rows?: number }) {
   return (
      <div className="space-y-3 p-4">
         {Array.from({ length: rows }).map((_, i) => (
            <div
               key={i}
               className="flex items-center gap-4 animate-pulse"
               style={{ animationDelay: `${i * 100}ms` }}
            >
               <div className="h-4 w-16 bg-white/10 rounded" />
               <div className="h-4 flex-1 bg-white/10 rounded" />
               <div className="h-4 w-24 bg-white/10 rounded" />
               <div className="h-4 w-20 bg-white/10 rounded" />
               <div className="h-8 w-32 bg-white/10 rounded" />
            </div>
         ))}
      </div>
   );
}

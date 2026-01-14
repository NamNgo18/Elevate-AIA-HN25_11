"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
   message: string;
   onRetry?: () => void;
   className?: string;
}

/**
 * A reusable error display component with optional retry functionality.
 */
export function ErrorDisplay({ message, onRetry, className = "" }: ErrorDisplayProps) {
   return (
      <div
         className={`flex flex-col items-center justify-center gap-4 p-8 rounded-xl bg-red-500/10 border border-red-500/20 ${className}`}
      >
         <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20">
            <AlertCircle className="h-8 w-8 text-red-400" />
         </div>
         <div className="text-center">
            <h3 className="text-lg font-semibold text-red-400 mb-2">
               Something went wrong
            </h3>
            <p className="text-slate-300 text-sm max-w-md">{message}</p>
         </div>
         {onRetry && (
            <Button
               onClick={onRetry}
               variant="outline"
               className="mt-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
               <RefreshCw className="h-4 w-4 mr-2" />
               Try Again
            </Button>
         )}
      </div>
   );
}

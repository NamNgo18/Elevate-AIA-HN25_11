import { useEffect, useState } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface QuestionTimerProps {
  maxTime?: number; // in seconds, default 120 (2 minutes)
  onTimeUp?: () => void;
  isActive: boolean;
  onReset?: () => void;
}

export function QuestionTimer({ maxTime = 120, onTimeUp, isActive, onReset }: QuestionTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(maxTime);

  useEffect(() => {
    if (onReset) {
      setTimeRemaining(maxTime);
    }
  }, [onReset, maxTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            onTimeUp?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeRemaining, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const percentage = (timeRemaining / maxTime) * 100;
  const isLowTime = timeRemaining <= 30 && timeRemaining > 0;
  const isTimeUp = timeRemaining === 0;

  return (
    <div className={`rounded-lg border p-4 transition-colors ${
      isTimeUp 
        ? "bg-destructive/10 border-destructive" 
        : isLowTime 
        ? "bg-orange-50 border-orange-300 dark:bg-orange-950 dark:border-orange-700" 
        : "bg-card border-border"
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isTimeUp ? (
            <AlertCircle className="h-4 w-4 text-destructive" />
          ) : (
            <Clock className={`h-4 w-4 ${isLowTime ? "text-orange-500" : "text-muted-foreground"}`} />
          )}
          <span className="text-sm text-muted-foreground">
            {isTimeUp ? "Time's up!" : "Thinking Time"}
          </span>
        </div>
        <span className={`font-mono text-2xl ${
          isTimeUp 
            ? "text-destructive" 
            : isLowTime 
            ? "text-orange-600 dark:text-orange-400" 
            : "text-foreground"
        }`}>
          {formatTime(timeRemaining)}
        </span>
      </div>
      
      <Progress 
        value={percentage} 
        className={`h-2 ${isTimeUp ? "bg-destructive/20" : isLowTime ? "bg-orange-200 dark:bg-orange-900" : ""}`}
      />
      
      {isTimeUp && (
        <p className="text-xs text-destructive mt-2">
          Don't worry! Take your time to give a complete answer.
        </p>
      )}
      
      {isLowTime && !isTimeUp && (
        <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
          ⏰ Less than 30 seconds remaining
        </p>
      )}
    </div>
  );
}

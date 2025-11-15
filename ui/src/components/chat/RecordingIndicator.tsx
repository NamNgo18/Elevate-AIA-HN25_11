import { useEffect, useState, useRef } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface RecordingIndicatorProps {
  maxTime?: number;     
  isActive: boolean;    
  onTimeUp?: () => void;
}

export function RecordingIndicator({
  maxTime = 120,
  isActive,
  onTimeUp
}: RecordingIndicatorProps) {
  const [timeRemaining, setTimeRemaining] = useState(maxTime);
  const [bars, setBars] = useState<number[]>([]);
  const hasTimeUpTrigger  = useRef(false);

  // Timer countdown
  useEffect(() => {
    if (!isActive)
      return;
    hasTimeUpTrigger.current = false
    setTimeRemaining(maxTime);
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!hasTimeUpTrigger.current) {
            onTimeUp?.();
            hasTimeUpTrigger.current = true
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, maxTime]);

  // Waveform animation
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setBars(Array.from({ length: 5 }, () => Math.random() * 100));
    }, 150);

    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const percentage = (timeRemaining / maxTime) * 100;
  const isLowTime = timeRemaining <= 0.3 * maxTime && timeRemaining > 0;
  const isTimeUp = timeRemaining === 0;

  return (
    <div
      className="w-full bg-destructive/10 border-destructive/20 flex flex-col gap-3 rounded-lg border px-4 py-2"
    >
      {/* HEADER: icon + label + time */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          {isTimeUp ? (
            <AlertCircle className="text-destructive h-4 w-4" />
          ) : (
            <Clock
              className={`h-4 w-4 ${
                isLowTime ? "text-orange-500" : "text-muted-foreground"
              }`}
            />
          )}
          <span className="text-muted-foreground text-sm">
            {isTimeUp ? "Time's up!" : "Recording Time"}
          </span>
        </div>

        <span
          className={`font-mono text-2xl ${
            isTimeUp
              ? "text-destructive"
              : isLowTime
              ? "text-orange-600 dark:text-orange-400"
              : "text-foreground"
          }`}
        >
          {formatTime(timeRemaining)}
        </span>
      </div>

      {/* Progress bar */}
      <Progress
        value={percentage}
        className={`h-2 ${
          isTimeUp
            ? "bg-destructive/20"
            : isLowTime
            ? "bg-orange-200 dark:bg-orange-900"
            : ""
        }`}
      />

      {/* STATE MESSAGES */}
      {isTimeUp && (
        <p className="text-destructive mt-1 text-xs">
          Recording stopped — time limit reached.
        </p>
      )}

      {isLowTime && !isTimeUp && (
        <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
          ⏰ Less than {Math.ceil(0.3 * maxTime)} seconds remaining
        </p>
      )}

      {/* Recording waveform */}
      {isActive && !isTimeUp && (
        <div className="flex items-center gap-3 w-full">
          {/* Pulsing dot */}
          <div className="relative flex items-center justify-center">
            <div className="bg-destructive absolute h-3 w-3 animate-ping rounded-full opacity-75" />
            <div className="bg-destructive relative h-2 w-2 rounded-full" />
          </div>

          <span className="text-destructive text-sm">Recording...</span>

          <div className="flex h-6 items-center gap-0.5 flex-1">
            {bars.map((height, i) => (
              <div
                key={i}
                className="bg-destructive w-1 rounded-full transition-all duration-150"
                style={{ height: `${Math.max(20, height)}%` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

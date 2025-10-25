import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, RotateCcw } from "lucide-react";

interface TimerProps {
  onTimeUpdate?: (seconds: number) => void;
}

export function Timer({ onTimeUpdate }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const newTime = prev + 1;
          onTimeUpdate?.(newTime);
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, onTimeUpdate]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReset = () => {
    setSeconds(0);
    setIsRunning(false);
    onTimeUpdate?.(0);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-muted-foreground mb-1">Response Time</p>
            <div className="text-3xl font-mono">{formatTime(seconds)}</div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

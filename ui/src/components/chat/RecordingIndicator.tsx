import { useEffect, useState } from "react";

export function RecordingIndicator() {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    // Generate random heights for audio bars to simulate waveform
    const interval = setInterval(() => {
      setBars(Array.from({ length: 5 }, () => Math.random() * 100));
    }, 150);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-destructive/10 border border-destructive/20 rounded-lg">
      {/* Pulsing red dot */}
      <div className="relative flex items-center justify-center">
        <div className="absolute h-3 w-3 bg-destructive rounded-full animate-ping opacity-75" />
        <div className="relative h-2 w-2 bg-destructive rounded-full" />
      </div>
      
      {/* Recording text */}
      <span className="text-sm text-destructive">Recording...</span>
      
      {/* Animated waveform bars */}
      <div className="flex items-center gap-0.5 h-6">
        {bars.map((height, i) => (
          <div
            key={i}
            className="w-1 bg-destructive rounded-full transition-all duration-150"
            style={{ height: `${Math.max(20, height)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

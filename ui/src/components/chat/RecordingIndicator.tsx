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
    <div className="bg-destructive/10 border-destructive/20 flex items-center gap-3 rounded-lg border px-4 py-2">
      {/* Pulsing red dot */}
      <div className="relative flex items-center justify-center">
        <div className="bg-destructive absolute h-3 w-3 animate-ping rounded-full opacity-75" />
        <div className="bg-destructive relative h-2 w-2 rounded-full" />
      </div>

      {/* Recording text */}
      <span className="text-destructive text-sm">Recording...</span>

      {/* Animated waveform bars */}
      <div className="flex h-6 items-center gap-0.5">
        {bars.map((height, i) => (
          <div
            key={i}
            className="bg-destructive w-1 rounded-full transition-all duration-150"
            style={{ height: `${Math.max(20, height)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

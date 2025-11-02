"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPreviewProps {
  onClose: () => void;
}

export function VideoPreview({ onClose }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    // Only run in the browser
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Camera API is not available in this browser.");
      return;
    }

    let mounted = true;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (!mounted) {
          // If component unmounted quickly, stop tracks immediately
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Some browsers require play() to be called explicitly
          void videoRef.current.play();
        }
        setIsStreaming(true);
      })
      .catch((err) => {
        console.error("Failed to access camera:", err);
        setError(String(err?.message || err));
      });

    return () => {
      mounted = false;
      // Stop camera when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const handleClose = () => {
    // Stop tracks when user closes the preview
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    onClose();
  };

  return (
    <div className="fixed right-6 bottom-24 z-50 h-28 w-44 overflow-hidden rounded-xl border-2 border-white bg-gray-900 shadow-2xl">
      <div className="relative h-full w-full bg-gradient-to-br from-gray-800 to-gray-900">
        {error ? (
          <div className="flex h-full w-full items-center justify-center text-center text-sm text-red-300">
            <div>
              <p className="mb-2">Unable to access camera</p>
              <p className="text-xs text-red-200">{error}</p>
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              muted
              playsInline
              autoPlay
            />
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center text-white/60">
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    <span className="text-xl">👤</span>
                  </div>
                  <p className="text-sm">Starting camera...</p>
                </div>
              </div>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

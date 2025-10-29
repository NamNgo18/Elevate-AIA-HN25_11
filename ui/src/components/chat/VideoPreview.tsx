import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPreviewProps {
  onClose: () => void;
}

export function VideoPreview({ onClose }: VideoPreviewProps) {
  return (
    <div className="fixed right-6 bottom-24 z-50 h-48 w-64 overflow-hidden rounded-xl border-2 border-white bg-gray-900 shadow-2xl">
      <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
        {/* Placeholder for video - in a real app, this would be a video element */}
        <div className="text-center text-white/50">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
            <span className="text-2xl">👤</span>
          </div>
          <p className="text-sm">Camera Preview</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

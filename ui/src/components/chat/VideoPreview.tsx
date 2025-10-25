import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPreviewProps {
  onClose: () => void;
}

export function VideoPreview({ onClose }: VideoPreviewProps) {
  return (
    <div className="fixed bottom-24 right-6 w-64 h-48 bg-gray-900 rounded-xl shadow-2xl overflow-hidden border-2 border-white z-50">
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
        {/* Placeholder for video - in a real app, this would be a video element */}
        <div className="text-white/50 text-center">
          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          <p className="text-sm">Camera Preview</p>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

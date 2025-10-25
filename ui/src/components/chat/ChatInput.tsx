import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Video, VideoOff, Send } from "lucide-react";
import { RecordingIndicator } from "./RecordingIndicator";
import { toast } from "sonner";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onToggleCamera: () => void;
  isCameraOn: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, onToggleCamera, isCameraOn, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    const newRecordingState = !isRecording;
    setIsRecording(newRecordingState);
    
    if (newRecordingState) {
      toast.info("Recording started");
      // In a real app, this would start voice recording
    } else {
      toast.info("Recording stopped");
      // In a real app, this would stop voice recording and process the audio
    }
  };

  return (
    <div className="border-t border-border bg-white">
      {/* Recording Indicator Bar */}
      {isRecording && (
        <div className="px-4 py-3 bg-muted/50 border-b border-border">
          <div className="max-w-4xl mx-auto flex items-center justify-center">
            <RecordingIndicator />
          </div>
        </div>
      )}
      
      {/* Input Area */}
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer here..."
                className="resize-none min-h-[56px] max-h-[200px] rounded-xl border-border focus-visible:ring-primary"
                disabled={disabled || isRecording}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                className="h-14 w-14 rounded-full"
                onClick={toggleRecording}
                disabled={disabled}
              >
                {isRecording ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
              
              <Button
                variant={isCameraOn ? "default" : "outline"}
                size="icon"
                className="h-14 w-14 rounded-full"
                onClick={onToggleCamera}
              >
                {isCameraOn ? (
                  <VideoOff className="h-5 w-5" />
                ) : (
                  <Video className="h-5 w-5" />
                )}
              </Button>
              
              <Button
                size="icon"
                className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90"
                onClick={handleSend}
                disabled={!message.trim() || disabled || isRecording}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

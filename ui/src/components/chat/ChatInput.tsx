import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Video, VideoOff, Send } from "lucide-react";
import { RecordingIndicator } from "./RecordingIndicator";
import { toast } from "sonner";

interface ChatInputProps {
  onSendMessage: (sender: string, message: string) => void;
  onToggleCamera: () => void;
  isCameraOn: boolean;
  disabled?: boolean;
}

export function ChatInput({
  onSendMessage,
  onToggleCamera,
  isCameraOn,
  disabled,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage("user", message);
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
    <div className="border-border border-t bg-white">
      {/* Recording Indicator Bar */}
      {isRecording && (
        <div className="bg-muted/50 border-border border-b px-4 py-3">
          <div className="mx-auto flex max-w-4xl items-center justify-center">
            <RecordingIndicator />
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer here..."
                className="border-border focus-visible:ring-primary max-h-[200px] min-h-[56px] resize-none rounded-xl"
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
                <div className="flex items-center justify-center rounded-full bg-gray-300 w-12 h-12">
                  {isRecording ? (
                    <MicOff className="h-5 w-5 text-red-900 animate-pulse" />
                  ) : (
                    <Mic className="h-5 w-5 text-gray-900"/>
                  )}
                </div>
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
                className="bg-primary hover:bg-primary/90 h-14 w-14 rounded-full"
                onClick={handleSend}
                disabled={!message.trim() || disabled || isRecording}
              >
                <Send className="h-5 w-5 " />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

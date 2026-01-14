import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Video, VideoOff, Send } from "lucide-react";
import { RecordingIndicator } from "./RecordingIndicator";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

interface ChatInputProps {
  onSendMessage: (sender: string, message: string) => void;
  onToggleCamera: () => void;
  isCameraOn: boolean;
  sendingMsgLocked?: boolean;
  chatInputLocked?: boolean;
}

import { useLanguage } from "@/contexts/LanguageContext";

export function ChatInput({
  onSendMessage,
  onToggleCamera,
  isCameraOn,
  sendingMsgLocked,
  chatInputLocked,
}: ChatInputProps) {
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSend = () => {
    if (message.trim() && !chatInputLocked) {
      onSendMessage("user", message)
      setMessage("")
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  };

  const toggleRecording = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const action_nm = !isRecording ? "start" : "stop";
    let audioPathToCleanup: string | null = null;

    try {
      toast.info(action_nm === "start" ? t("recordingStarted") : t("recordingStopped"));

      const resp_voice = await apiClient.post(
        "/routes/speech/voice", null, { params: { action: action_nm } }
      );

      if (action_nm === "start") {
        setIsRecording(true);
      } else {
        setIsRecording(false);
        audioPathToCleanup = resp_voice?.data?.audio_path;

        console.log("Stop recording now...");

        if (audioPathToCleanup) {
          const resp_stt = await apiClient.post(
            "/routes/speech/stt", null, { params: { audio_path: audioPathToCleanup } }
          );

          if (resp_stt.data.text) {
            onSendMessage(resp_stt.data.role, resp_stt.data.text);
            setMessage("");
          }
        }
      }
      console.log("Voice action successful:", action_nm, resp_voice?.data);
    } catch (error: any) {
      console.error("Recording error:", error);
      setIsRecording(false);
      const errorMessage = error.response?.data?.error || error.message || "Unknown error";
      alert("ERROR: " + errorMessage);
    } finally {
      // Unlink the audio file to save memory/space
      if (audioPathToCleanup) {
        try {
          const resp = await apiClient.delete(
            "/routes/speech/audio", { params: { audio_path: audioPathToCleanup } }
          );
          console.log("Deleted audio file:", audioPathToCleanup, resp.data.deleted);
        } catch (deleteError) {
          console.error("Failed to delete audio file:", deleteError);
        }
      }
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative border-t border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
      {/* Recording Indicator Bar */}
      {isRecording && (
        <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-sm border-b border-red-400/30 px-4 py-3">
          <div className="mx-auto flex max-w-4xl items-center justify-center">
            <RecordingIndicator
              isActive={isRecording}
              onTimeUp={toggleRecording}
            />
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("typeAnswerPlaceholder")}
                className="bg-white/10 border-white/20 text-slate-100 placeholder:text-slate-400 focus-visible:ring-purple-400/50 focus-visible:border-purple-400 max-h-[200px] min-h-[60px] resize-none rounded-2xl backdrop-blur-sm shadow-lg transition-all duration-200 focus:bg-white/15"
                disabled={chatInputLocked || isRecording}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                className={`h-16 w-16 rounded-full transition-all duration-300 hover:scale-110 shadow-lg ${isRecording
                  ? "bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0 shadow-red-500/50"
                  : "bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-sm shadow-purple-500/20"
                  } ${isProcessing ? 'opacity-80' : ''}`}
                onClick={toggleRecording}
                disabled={chatInputLocked || isProcessing}
              >
                <div className={`flex items-center justify-center rounded-full w-14 h-14 ${isRecording ? "bg-white/20" : "bg-gradient-to-br from-purple-500/30 to-blue-500/30"
                  }`}>
                  {isProcessing ? (
                    <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isRecording ? (
                    <MicOff className="h-6 w-6 text-white animate-pulse" />
                  ) : (
                    <Mic className="h-6 w-6 text-purple-300" />
                  )}
                </div>
              </Button>

              <Button
                variant={isCameraOn ? "default" : "outline"}
                size="icon"
                className={`h-16 w-16 rounded-full transition-all duration-300 hover:scale-110 shadow-lg ${isCameraOn
                  ? "bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-0 shadow-blue-500/50"
                  : "bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-sm shadow-blue-500/20"
                  }`}
                onClick={onToggleCamera}
              >
                {isCameraOn ? (
                  <VideoOff className="h-6 w-6 text-white" />
                ) : (
                  <Video className="h-6 w-6 text-blue-300" />
                )}
              </Button>

              <Button
                size="icon"
                className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 shadow-lg shadow-purple-500/50 transition-all duration-300 hover:shadow-purple-500/70 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSend}
                disabled={!message.trim() || sendingMsgLocked || chatInputLocked || isRecording}
              >
                <Send className="h-6 w-6 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

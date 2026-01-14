import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "ai" | "user";
  content: string;
  timestamp?: string;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isAI = role === "ai";

  return (
    <div
      className={`flex gap-3 ${isAI ? "justify-start" : "justify-end"} mb-6 animate-fadeIn`}
    >
      {isAI && (
        <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/30">
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`flex max-w-[70%] flex-col ${!isAI && "items-end"}`}>
        <div
          className={`rounded-2xl px-5 py-4 shadow-xl backdrop-blur-lg transition-all duration-200 hover:scale-[1.02] ${isAI
              ? "bg-white/10 text-slate-100 border border-white/20 shadow-purple-500/10"
              : "bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-purple-500/30 border border-purple-400/30"
            }`}
        >
          <p className="break-words whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
        {timestamp && (
          <span className="mt-2 px-2 text-xs text-slate-400 font-medium">
            {timestamp}
          </span>
        )}
      </div>

      {!isAI && (
        <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/30">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

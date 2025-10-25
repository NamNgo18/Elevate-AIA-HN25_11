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
    <div className={`flex gap-3 ${isAI ? "justify-start" : "justify-end"} mb-4`}>
      {isAI && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col max-w-[70%] ${!isAI && "items-end"}`}>
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isAI
              ? "bg-white border border-border rounded-tl-sm"
              : "bg-primary text-primary-foreground rounded-tr-sm"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>
        {timestamp && (
          <span className="text-xs text-muted-foreground mt-1 px-1">
            {timestamp}
          </span>
        )}
      </div>

      {!isAI && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-accent text-accent-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

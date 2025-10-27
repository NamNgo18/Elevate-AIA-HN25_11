"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { VideoPreview } from "@/components/chat/VideoPreview";
import { QuestionTimer } from "@/components/chat/QuestionTimer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Clock } from "lucide-react";
import { toast } from "sonner";
import { questions } from "@/features/questions/Question.types";

interface Message {
  id: number;
  role: "ai" | "user";
  content: string;
  timestamp: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [interviewTime, setInterviewTime] = useState(0);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isQuestionActive, setIsQuestionActive] = useState(false);
  const [questionTimerKey, setQuestionTimerKey] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInterviewStarted) {
      interval = setInterval(() => {
        setInterviewTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInterviewStarted]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start interview with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 0,
      role: "ai",
      content: `Hello! I'm your AI interviewer for today's mock interview session. I'm here to help you practice and improve your interview skills.\n\nWe'll go through ${questions.length} questions covering various topics like behavioral, technical, problem-solving, and more.\n\nTake your time with each answer, and remember - this is a safe space to practice!\n\nAre you ready to begin?`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages([welcomeMessage]);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const askNextQuestion = () => {
    if (currentQuestionIndex < questions.length) {
      const question = questions[currentQuestionIndex];
      const newMessage: Message = {
        id: messages.length,
        role: "ai",
        content: `Question ${currentQuestionIndex + 1} of ${questions.length}\n\n${question.question}\n\n💡 Tips:\n${question.tips.map((tip) => `• ${tip}`).join("\n")}`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, newMessage]);
      setCurrentQuestionIndex((prev) => prev + 1);

      // Start the question timer
      setIsQuestionActive(true);
      setQuestionTimerKey((prev) => prev + 1);
    } else {
      // Interview complete
      const completeMessage: Message = {
        id: messages.length,
        role: "ai",
        content: `🎉 Congratulations! You've completed all ${questions.length} questions.\n\nYou did great! Remember, practice makes perfect. Keep refining your answers and you'll be ready for any real interview.\n\nWould you like to start over or review your responses?`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, completeMessage]);
      setIsQuestionActive(false);
    }
  };

  const handleSendMessage = (content: string) => {
    if (!isInterviewStarted) {
      setIsInterviewStarted(true);
    }

    const userMessage: Message = {
      id: messages.length,
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Stop the question timer when user answers
    setIsQuestionActive(false);

    // AI response after user answers
    setTimeout(() => {
      const responses = [
        "Great answer! I appreciate the detail you provided.",
        "That's a solid response. I like how you structured your answer.",
        "Excellent! You covered the key points well.",
        "Good thinking! Your approach shows maturity.",
        "Nice work! That demonstrates strong understanding.",
      ];

      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      const feedbackMessage: Message = {
        id: messages.length + 1,
        role: "ai",
        content: `${randomResponse}\n\nLet's move on to the next question.`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, feedbackMessage]);

      // Ask next question after a short delay
      setTimeout(() => {
        askNextQuestion();
      }, 1000);
    }, 800);
  };

  const handleToggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    toast.info(isCameraOn ? "Camera disabled" : "Camera enabled");
  };

  const handleStartInterview = () => {
    setIsInterviewStarted(true);
    askNextQuestion();
  };

  return (
    <div className="bg-background flex h-screen flex-col">
      {/* Header */}
      <header className="border-border flex-shrink-0 border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-full">
              <Sparkles className="text-primary-foreground h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl">MockMate AI</h1>
              <p className="text-muted-foreground text-sm">
                AI-Powered Interview Practice
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="px-3 py-1.5">
              Question {Math.min(currentQuestionIndex, questions.length)} /{" "}
              {questions.length}
            </Badge>
            <div className="bg-accent/50 flex items-center gap-2 rounded-lg px-4 py-2">
              <Clock className="text-accent-foreground h-4 w-4" />
              <span className="text-accent-foreground font-mono">
                {formatTime(interviewTime)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-4xl">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}

          {/* Question Timer - shows when a question is active */}
          {isQuestionActive && currentQuestionIndex > 0 && (
            <div className="my-4">
              <QuestionTimer
                key={questionTimerKey}
                isActive={isQuestionActive}
                onTimeUp={() =>
                  toast.warning(
                    "Time's up! But feel free to continue with your answer.",
                  )
                }
              />
            </div>
          )}

          {/* Start Button */}
          {!isInterviewStarted && messages.length === 1 && (
            <div className="mt-6 flex justify-center">
              <Button
                size="lg"
                className="rounded-full px-8"
                onClick={handleStartInterview}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Interview
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onToggleCamera={handleToggleCamera}
        isCameraOn={isCameraOn}
        disabled={!isInterviewStarted}
      />

      {/* Video Preview */}
      {isCameraOn && <VideoPreview onClose={() => setIsCameraOn(false)} />}
    </div>
  );
}

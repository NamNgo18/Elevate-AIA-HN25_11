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
import apiClient from "@/lib/api-client";
import { useRouter, useSearchParams } from "next/navigation";

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: string;
}

import { useLanguage } from "@/contexts/LanguageContext";

export default function App() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestion, setTotalQuestion] = useState(0);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [interviewTime, setInterviewTime] = useState(0);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isQuestionActive, setIsQuestionActive] = useState(false);
  const [isInteractionLocked, setIsInteractionLocked] = useState(false);
  const [questionTimerKey, setQuestionTimerKey] = useState(0);
  const [sessionID, setSessionID] = useState<string>("Unknown Session ID");
  const resultSearchParams = useSearchParams();
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false);
  const [lastUserQuestionIndex, setLastUserQuestionIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(false);
  const router = useRouter();

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

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize interview with welcome message
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const initializeInterview = async () => {
      setIsInteractionLocked(true);
      handleAddMessage(
        "ai",
        `🎯 ${t("interviewGuidelines")}\n\n${t("welcomeMessage")}\n\n🧩 ${t("interviewFormat")}\n\n${t("interviewFormatDesc")}\n\n💬 ${t("howToAnswer")}\n\n${t("howToAnswerDesc")}\n\n🌟 ${t("tipsTitle")}\n\n${t("tipsDesc")}`,
      );

      try {
        const resp = await apiClient.post("/routes/qna/start", {
          jd_id: jdIDParser,
          cv_id: cvIdParser,
        });
        console.log("AI response user's question:", resp);
        setSessionID(resp.data.session_id);
        console.log(resp.data.reply);
        setIsInteractionLocked(false);
      } catch (error: any) {
        console.error("Error calling backend:", error);
        alert(`${t("error")}: ` + (error.response?.data?.error || error.message));
      }
    };

    const jdIDParser = resultSearchParams.get("jd_id");
    const cvIdParser = resultSearchParams.get("cv_id");
    if (!jdIDParser) {
      const err_msg: string = t("missingIdsError");
      console.log(
        err_msg + "\nJD ID : " + jdIDParser + "\nCV ID : " + cvIdParser,
      );
      handleAddMessage(
        "ai",
        err_msg + "\nJD ID : " + jdIDParser + "\nCV ID : " + cvIdParser,
      );
      alert(err_msg);
      return;
    }
    // Call the async function
    initializeInterview();
  }, [t]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAddMessage = (
    sender: "ai" | "user",
    params: string | string[],
  ) => {
    const replyText: string[] = Array.isArray(params) ? params : [params];
    const newMsg: Message[] = replyText.map((text) => ({
      id: crypto.randomUUID(),
      role: sender,
      content: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
    setMessages((prev) => [...prev, ...newMsg]);
  };

  const handleSendMessage = async (sender: string, content: string) => {
    if (!isInterviewStarted) setIsInterviewStarted(true);

    // Track this as the user's latest question
    setLastUserQuestionIndex(currentQuestionIndex + 1);

    setIsInteractionLocked(true);
    handleAddMessage(sender === "user" ? "user" : "ai", content);

    try {
      const resp = await apiClient.post("/routes/qna/answer", {
        session_id: sessionID,
        answer: content,
      });

      // Add AI reply
      handleAddMessage(resp.data.role, resp.data.reply);

      // Update question index and total
      setCurrentQuestionIndex(resp.data.question.current_idx);
      setTotalQuestion(resp.data.question.total);

      // ✅ Only trigger completion after AI responds to last user question
      if (
        resp.data.question.current_idx >= resp.data.question.total &&
        lastUserQuestionIndex >= resp.data.question.total
      ) {
        // Fixed congratulatory message
        handleAddMessage(
          "ai",
          `🎉 ${t("congratulations")}`,
        );
        setIsInterviewCompleted(true);
      }

      setIsInteractionLocked(false);
    } catch (error: any) {
      console.error("Error calling backend:", error);
      alert(`${t("error")}: ` + (error.response?.data?.error || error.message));
    }

    setIsQuestionActive(false);
  };

  const handleToggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    toast.info(isCameraOn ? t("cameraDisabled") : t("cameraEnabled"));
  };

  const handleStartInterview = async () => {
    setIsInteractionLocked(true);
    try {
      const resp = await apiClient.post("/routes/qna/answer", {
        session_id: sessionID,
        answer: "Generate no more than 3 in total",
      });
      console.log("AI start response:", resp);
      setMessages([]); // The conversation should empty after starting
      handleAddMessage(resp.data.role, resp.data.reply);
      setCurrentQuestionIndex(resp.data.question.current_idx);
      setTotalQuestion(resp.data.question.total);
      setIsInterviewStarted(true);
      setIsInteractionLocked(false);
    } catch (error: any) {
      console.error("Error calling backend:", error);
      alert(`${t("error")}: ` + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col h-screen overflow-hidden">
      {/* Animated background pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-800/15 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-800/15 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative flex-shrink-0 border-b border-white/10 bg-white/5 backdrop-blur-xl px-6 py-4 shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/50">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                {t("interviewPracticeTitle")}
              </h1>
              <p className="text-slate-300 text-sm">
                {t("interviewPracticeSubtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge
              variant="secondary"
              className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-400/30 text-purple-200 shadow-lg"
            >
              {t("questionNum")} {Math.min(currentQuestionIndex, totalQuestion)} /{" "}
              {totalQuestion}
            </Badge>
            <div className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 shadow-lg">
              <Clock className="h-5 w-5 text-blue-400" />
              <span className="font-mono text-lg text-slate-200">
                {formatTime(interviewTime)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="relative flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
        <div className="mx-auto max-w-4xl">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}

          {/* Question Timer */}
          {isQuestionActive && currentQuestionIndex > 0 && (
            <div className="my-4">
              <QuestionTimer
                key={questionTimerKey}
                isActive={isQuestionActive}
                onTimeUp={() =>
                  toast.warning(
                    t("timesUp"),
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
                className="rounded-full px-10 py-6 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg shadow-purple-500/50 transition-all duration-300 hover:shadow-purple-500/70 hover:scale-105"
                onClick={handleStartInterview}
                disabled={isInteractionLocked}
              >
                <Sparkles className="mr-2 h-6 w-6" />
                {t("startInterview")}
              </Button>
            </div>
          )}

          {/* ✅ View Result Button */}
          {isInterviewCompleted && (
            <div className="mt-6 flex justify-center">
              <Button
                size="lg"
                className="rounded-full px-10 py-6 text-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/50 transition-all duration-300 hover:shadow-emerald-500/70 hover:scale-105"
                onClick={() =>
                  router.push(`/interview-results?session_id=${sessionID}`)
                }
              >
                {t("viewResult")}
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
        chatInputLocked={!isInterviewStarted}
        sendingMsgLocked={isInteractionLocked}
      />

      {/* Video Preview */}
      {isCameraOn && <VideoPreview onClose={() => setIsCameraOn(false)} />}
    </div>
  );
}

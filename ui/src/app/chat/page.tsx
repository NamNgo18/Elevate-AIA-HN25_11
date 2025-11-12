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

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestion, setTotalQuestion] = useState(0);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [interviewTime, setInterviewTime] = useState(0);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isQuestionActive, setIsQuestionActive] = useState(false);
  const [isInteractionLocked, setIsInteractionLocked] = useState(false);
  const [questionTimerKey, setQuestionTimerKey] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionID, setSessionID] = useState<string>("Unknow Session ID");

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
    handleAddMessage("ai", `🎯 Interview Practice Guidelines\n\nWelcome! Please review these instructions to help you perform successfully in your interview.\n\n🧩 1. Interview Format\n\nThe interview will include a few main questions.\nSome questions may include follow-up (sub) questions to clarify your answers or gather more details.\n\n💬 2. How to Answer\n\nYou have two options for answering:\n✏️ Type your answer in the input box.\n🎤 Speak your answer by clicking the microphone icon.\n\n🌟 3. Tips for a Successful Interview\n\n🌬️ Take a deep breath before you begin.\n🤫 Stay in a quiet, distraction-free space.\n👂 Listen carefully to each question.\n🗣️ Answer clearly and confidently — be concise and natural.\n💡 If you don’t understand a question, it’s okay to ask for clarification.`)
    setIsInteractionLocked(false)
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAddMessage = (sender: "ai" | "user", params: string | string[]) => {
     const reply_text: string[] = Array.isArray(params) ? params : [params];
     console.log("AI replied: " + reply_text)
     const newMsg: Message[] = reply_text.map((text) => ({
       id: crypto.randomUUID(),
       role: sender,
       content: text,
       timestamp: new Date().toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})
     }));
     setMessages((prev) => [...prev, ...newMsg]);
  };

  const handleSendMessage = async (sender: string, content: string) => {
    if (!isInterviewStarted) {
      setIsInterviewStarted(true);
    }
    
    // Show the user's answer
    setIsInteractionLocked(true)
    handleAddMessage((sender == "user") ? "user" : "ai", content)

    // Show the ai's response
    try {
      const resp = await apiClient.post("/routes/qna/answer", {session_id: sessionID, answer: content});
      console.log("AI response user's question:", resp);
      handleAddMessage(resp.data.role, resp.data.reply)
      setCurrentQuestionIndex(resp.data.question.current_idx)
      setTotalQuestion(resp.data.question.total)
      setIsInteractionLocked(false)
    } catch (error) {
      console.error("Error calling backend:", error);
    }
    // Stop the question timer when user answers
    setIsQuestionActive(false);

    // AI response after user answers
    // setTimeout(() => {
    //   const responses = [
    //     "Great answer! I appreciate the detail you provided.",
    //     "That's a solid response. I like how you structured your answer.",
    //     "Excellent! You covered the key points well.",
    //     "Good thinking! Your approach shows maturity.",
    //     "Nice work! That demonstrates strong understanding.",
    //   ];

    //   const randomResponse =
    //     responses[Math.floor(Math.random() * responses.length)];

    //   const feedbackMessage: Message = {
    //     id: messages.length + 1,
    //     role: "ai",
    //     content: `${randomResponse}\n\nLet's move on to the next question.`,
    //     timestamp: new Date().toLocaleTimeString([], {
    //       hour: "2-digit",
    //       minute: "2-digit",
    //     }),
    //   };
    //   setMessages((prev) => [...prev, feedbackMessage]);

    //   // Ask next question after a short delay
    //   setTimeout(() => {
    //     askNextQuestion();
    //   }, 1000);
    // }, 800);
  };

  const handleToggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    toast.info(isCameraOn ? "Camera disabled" : "Camera enabled");
  };

  const handleStartInterview = async () => {
    setIsInteractionLocked(true)
    const pay_load = {
      job_description : {
          "title": "Software Engineer",
          "location": "Remote",
          "type": "Full-time",
          "responsibilities": [
              "Develop and maintain web applications.",
              "Collaborate with teams to design new features.",
              "Write clean and efficient code."
          ],
          "requirements": [
              "3+ years of experience with JavaScript or Python.",
              "Strong problem-solving and communication skills."
          ]
      }
    };

    try {
      const resp = await apiClient.post("/routes/qna/start", pay_load);
      console.log("AI start response:", resp);
      setMessages([]); // The conversation should empty after starting
      setSessionID(resp.data.session_id);
      handleAddMessage(resp.data.role, resp.data.reply)
      setCurrentQuestionIndex(resp.data.question.current_idx)
      setTotalQuestion(resp.data.question.total)
      setIsInterviewStarted(true);
      setIsInteractionLocked(false)
    } catch (error) {
      console.error("Error calling backend:", error);
    }
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
              <h1 className="text-xl">AI-X</h1>
              <p className="text-muted-foreground text-sm">
                AI-Powered Interview Practice
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="px-3 py-1.5">
              Question {Math.min(currentQuestionIndex, totalQuestion)} /{" "}{totalQuestion}
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
                onTimeUp={() => toast.warning(
                    "Time's up! But feel free to continue with your answer.",
                )}
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
                disabled={isInteractionLocked}
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
        chatInputLocked={!isInterviewStarted}
        sendingMsgLocked={isInteractionLocked}
      />

      {/* Video Preview */}
      {isCameraOn && <VideoPreview onClose={() => setIsCameraOn(false)} />}
    </div>
  );
}

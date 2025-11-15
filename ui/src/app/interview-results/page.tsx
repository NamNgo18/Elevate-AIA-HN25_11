"use client";

import { useEffect, useState, useRef } from "react";
import { InterviewResult } from "@/components/interview-result/InterviewResult";
import { useInterviewResult } from "@/features/interview-result/useInterviewResult";
import { CandidateData } from "@/features/interview-result/InterviewResult.types";
import { useSearchParams } from "next/navigation";

function InterviewResultPage() {
  const { interviewReport, loading, generateResult } = useInterviewResult();

  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const hasCalledRef = useRef(false);

  useEffect(() => {
    if (!sessionId) return;
    if (hasCalledRef.current) return;

    hasCalledRef.current = true;
    generateResult(sessionId).catch((err) =>
      console.error("Failed to generate interview result:", err),
    );
  }, [sessionId, generateResult]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-8">
        <p className="text-gray-600">Generating interview result...</p>
      </div>
    );
  }

  if (!interviewReport || !sessionId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-8">
        <p className="text-gray-600">No interview data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <InterviewResult
        candidate={interviewReport.candidate}
        interviewSummary={interviewReport.interview_summary}
      />
    </div>
  );
}

export default InterviewResultPage;

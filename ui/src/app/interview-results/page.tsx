"use client";

import { useEffect, useState, useRef } from "react";
import { InterviewResult } from "@/components/interview-result/InterviewResult";
import { useInterviewResult } from "@/features/interview-result/useInterviewResult";
import { CandidateData } from "@/features/interview-result/InterviewResult.types";

function InterviewResultPage() {
  const { interviewReport, loading, generateResult } = useInterviewResult();

  const [candidateData] = useState<CandidateData | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem("interviewData");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const hasCalledRef = useRef(false);

  useEffect(() => {
    if (!candidateData) return;
    if (hasCalledRef.current) return;

    hasCalledRef.current = true;
    generateResult(candidateData).catch((err) =>
      console.error("Failed to generate interview result:", err),
    );
  }, [candidateData, generateResult]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-8">
        <p className="text-gray-600">Generating interview result...</p>
      </div>
    );
  }

  if (!interviewReport || !candidateData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-8">
        <p className="text-gray-600">No interview data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <InterviewResult
        candidate={candidateData.candidate}
        interviewResult={interviewReport}
      />
    </div>
  );
}

export default InterviewResultPage;

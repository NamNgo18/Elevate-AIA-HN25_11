"use client";

import { useEffect, useState, useCallback } from "react";
import { InterviewResult } from "@/components/interview-result/InterviewResult";
import { useInterviewResult } from "@/features/interview-result/useInterviewResult";
import { CandidateData } from "@/features/interview-result/InterviewResult.types";

function InterviewResultPage() {
  const { interviewReport, loading, generateResult } = useInterviewResult();

  const [candidateData, setCandidateData] = useState<CandidateData | null>(
    () => {
      if (typeof window === "undefined") return null;
      const storedData = sessionStorage.getItem("interviewData");
      if (!storedData) return null;
      try {
        return JSON.parse(storedData);
      } catch (err) {
        console.error(
          "Failed to parse interviewData from sessionStorage:",
          err,
        );
        return null;
      }
    },
  );

  const fetchInterviewResult = useCallback(async () => {
    if (candidateData && !interviewReport) {
      try {
        await generateResult(candidateData);
      } catch (err) {
        console.error("Failed to generate interview result:", err);
      }
    }
  }, [candidateData, generateResult, interviewReport]);

  useEffect(() => {
    fetchInterviewResult();
  }, [fetchInterviewResult]);

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

"use client";

import { useState } from "react";
import { interviewResultApi } from "./InterviewResult.api";
import { InterviewResult, CandidateData } from "./InterviewResult.types";

export function useInterviewResult() {
  const [interviewReport, setInterviewResult] =
    useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateResult = async (candidateData: CandidateData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await interviewResultApi.generateResult(candidateData);
      setInterviewResult(result);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate result";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    interviewReport,
    loading,
    error,
    generateResult,
  };
}

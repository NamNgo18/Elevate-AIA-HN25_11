"use client";

import { useState } from "react";
import { interviewResultApi } from "./InterviewResult.api";
import { InterviewResult, CandidateData } from "./InterviewResult.types";

export function useInterviewResult() {
  const [interviewReport, setInterviewResult] =
    useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function generateResult(candidateData: CandidateData) {
    setLoading(true);

    const generatedResult =
      await interviewResultApi.generateResult(candidateData);

    setInterviewResult(generatedResult);
    setLoading(false);
  }

  return { report: interviewReport, loading, generateReport: generateResult };
}

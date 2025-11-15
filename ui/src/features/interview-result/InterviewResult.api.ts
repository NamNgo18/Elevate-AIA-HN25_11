import apiClient from "@/lib/api-client";

import { InterviewResult, CandidateData } from "./InterviewResult.types";

export const interviewResultApi = {
  async generateResult(candidateData: CandidateData): Promise<InterviewResult> {
    const res = await apiClient.post("/routes/report", candidateData);
    return res.data;
  },
};

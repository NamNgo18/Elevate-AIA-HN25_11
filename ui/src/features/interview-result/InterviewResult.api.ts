import apiClient from "@/lib/api-client";

import { InterviewResult } from "./InterviewResult.types";

export const interviewResultApi = {
  async generateResult(sessionId: string): Promise<InterviewResult> {
    const res = await apiClient.get(`/routes/report?session_id=${sessionId}`);
    return res.data;
  },
};

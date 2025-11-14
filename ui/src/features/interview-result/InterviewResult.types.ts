export interface InterviewResult {
  passed: boolean;
  overall_score: number;
  technical_skill: number;
  problem_solving: number;
  communication: number;
  experience: number;
  pros: string[];
  cons: string[];
}

export interface CandidateData {
  candidate: Candidate;
  conversation_history: ConversationMessage[];
}

export interface Candidate {
  name: string;
  target_position: string;
  contact_phone: string;
  email_address: string;
}

export interface ConversationMessage {
  role: "user" | "ai";
  content: string;
}

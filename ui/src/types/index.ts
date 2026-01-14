/**
 * Global Type Definitions for the Interview AI System
 * 
 * This file contains all shared TypeScript interfaces and types
 * used across the frontend application.
 */

// ============================================
// API Response Types
// ============================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data: T;
  error?: string;
  message?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// Document Types (CV & JD)
// ============================================

/**
 * Base document metadata for CVs and JDs
 */
export interface DocumentMetadata {
  id: string;
  name: string;
  uploadBy: string;
  uploadDate: string;
}

/**
 * CV (Curriculum Vitae) document
 */
export interface CV extends DocumentMetadata {}

/**
 * Job Description document
 */
export interface JobDescription extends DocumentMetadata {}

/**
 * CV Analysis data structure
 */
export interface CVAnalysis {
  metadata?: {
    cv_id: string;
    source_file_name?: string;
    scanned_at?: string;
    uploaded_by?: string;
  };
  basics?: {
    cv_id?: string;
    name?: string;
    label?: string;
    email?: string;
    phone_number?: string;
    summary?: string;
    location?: {
      city?: string;
      countryCode?: string;
    };
  };
  work?: Array<{
    name?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
  }>;
  education?: Array<{
    institution?: string;
    area?: string;
    studyType?: string;
    startDate?: string;
    endDate?: string;
    score?: string;
  }>;
  skills?: Array<{
    name?: string;
    level?: string;
    keywords?: string[];
  }>;
  awards?: Array<{
    title?: string;
    date?: string;
    awarder?: string;
  }>;
}

/**
 * JD Analysis data structure
 */
export interface JDAnalysis {
  metadata?: {
    jd_id: string;
    source_file_name?: string;
    scanned_at?: string;
    uploaded_by?: string;
  };
  basic_info?: {
    job_title?: string;
    company_name?: string;
    location?: string;
    department?: string;
    job_type?: "full-time" | "part-time" | "contract" | "internship";
  };
  content?: {
    summary?: string;
    responsibilities?: string[];
    requirements?: string[];
    benefits?: string[];
    salary?: {
      min?: number;
      max?: number;
      currency?: string;
      text?: string;
    };
  };
  match_criteria?: {
    experience?: {
      min_years?: number;
      max_years?: number;
      fields?: string[];
    };
    education?: Array<{
      degree?: string;
      major?: string;
      level?: "mandatory" | "preferred";
    }>;
    skills?: Array<{
      name?: string;
      level?: "mandatory" | "preferred";
      category?: string;
    }>;
    keywords?: string[];
  };
}

// ============================================
// Interview Types
// ============================================

/**
 * Interview session phases
 */
export type InterviewPhase = 
  | "UNKNOWN"
  | "INTRO"
  | "READINESS" 
  | "INTERVIEW"
  | "WARMUP"
  | "COMPLETED";

/**
 * Chat message in the interview
 */
export interface ChatMessage {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: string;
}

/**
 * Interview question structure
 */
export interface InterviewQuestion {
  id: string;
  text: string;
  topic?: string;
  level?: "easy" | "medium" | "hard";
}

/**
 * Interview session state
 */
export interface InterviewSession {
  sessionId: string;
  phase: InterviewPhase;
  currentQuestionIndex: number;
  totalQuestions: number;
  messages: ChatMessage[];
  isStarted: boolean;
  isCompleted: boolean;
}

/**
 * Interview start request payload
 */
export interface InterviewStartRequest {
  jd_id: string;
  cv_id: string;
}

/**
 * Interview answer request payload
 */
export interface InterviewAnswerRequest {
  session_id: string;
  answer: string;
}

/**
 * Interview start response from API
 */
export interface InterviewStartResponse {
  role: "ai";
  session_id: string | null;
  reply: string | null;
  error: string | null;
}

/**
 * Interview answer response from API
 */
export interface InterviewAnswerResponse {
  role: "ai";
  reply: string | string[] | null;
  question: {
    total: number | null;
    current_idx: number | null;
  };
  error: string | null;
}

// ============================================
// Interview Results Types
// ============================================

/**
 * Candidate information from interview summary
 */
export interface CandidateInfo {
  name: string | null;
  target_position: string | null;
  contact_phone: string | null;
  email_address: string | null;
}

/**
 * Conversation history entry
 */
export interface ConversationEntry {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Interview summary/report
 */
export interface InterviewSummary {
  candidate: CandidateInfo;
  conversation_history: ConversationEntry[];
}

/**
 * Interview report with evaluation
 */
export interface InterviewReport {
  candidate_name: string;
  applied_position: string;
  interview_date: string;
  overall_score: number;
  sections: Array<{
    name: string;
    score: number;
    feedback: string;
  }>;
  strengths: string[];
  areas_for_improvement: string[];
  recommendation: "Hire" | "Consider" | "Reject";
  detailed_feedback: string;
}

// ============================================
// CV-JD Matching Types
// ============================================

/**
 * Candidate match result
 */
export interface CandidateMatch {
  cv_id: string;
  cv_name: string;
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  experience_match: boolean;
  education_match: boolean;
}

/**
 * Find candidate request
 */
export interface FindCandidateRequest {
  jd_id: string;
}

/**
 * Find candidate response
 */
export interface FindCandidateResponse {
  jd_id: string;
  candidates: CandidateMatch[];
}

// ============================================
// Speech/Audio Types
// ============================================

/**
 * Voice recording action
 */
export type VoiceAction = "start" | "stop";

/**
 * Voice recording response
 */
export interface VoiceRecordingResponse {
  audio_path: string;
  status: "recording" | "stopped";
}

/**
 * Speech-to-text response
 */
export interface SpeechToTextResponse {
  role: "user";
  text: string;
}

// ============================================
// UI State Types
// ============================================

/**
 * Loading state for async operations
 */
export interface LoadingState<T = unknown> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Dialog/Modal state
 */
export interface DialogState {
  isOpen: boolean;
  data?: unknown;
}

/**
 * Filter state for tables
 */
export interface FilterState {
  search: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

// ============================================
// User Types
// ============================================

/**
 * User role
 */
export type UserRole = "admin" | "interviewer" | "candidate";

/**
 * User profile
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Email Types
// ============================================

/**
 * Send email request
 */
export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  attachments?: string[];
}

/**
 * Send email response
 */
export interface SendEmailResponse {
  success: boolean;
  message_id?: string;
  error?: string;
}

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Briefcase,
  User,
} from "lucide-react";
import type {
  Candidate,
  InterviewResult,
} from "@/features/interview-result/InterviewResult.types";

interface InterviewResultProps {
  candidate: Candidate;
  interviewResult: InterviewResult;
}

export function InterviewResult({
  candidate,
  interviewResult,
}: InterviewResultProps) {
  return (
    <div className="mx-auto w-full space-y-6 p-6">
      {/* FULL-WIDTH OVERALL SCORE */}
      <Card className="p-6">
        <div className="text-center">
          <h2 className="mb-4">Overall Interview Score</h2>
          <div className="mb-4 flex items-center justify-center gap-4">
            <div
              className={`text-6xl ${
                interviewResult.passed ? "text-green-600" : "text-red-600"
              }`}
            >
              {interviewResult.overall_score}
            </div>
            <div className="text-gray-500">/100</div>
          </div>
          <Progress value={interviewResult.overall_score} className="h-3" />
        </div>
      </Card>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="h-full space-y-6">
          <Card className="flex h-full flex-col justify-between p-6">
            {/* Header with Pass/Fail */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="mb-2">Interview Result</h1>
                  <p className="text-gray-600">Assessment Report</p>
                </div>

                <div className="flex items-center gap-3">
                  {interviewResult.passed ? (
                    <>
                      <CheckCircle2 className="h-12 w-12 text-green-600" />
                      <Badge className="bg-green-600 px-4 py-2 text-lg text-white">
                        PASSED
                      </Badge>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-12 w-12 text-red-600" />
                      <Badge className="bg-red-600 px-4 py-2 text-lg text-white">
                        FAILED
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              <Separator className="mb-6" />
            </div>

            {/* Candidate Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="mb-1 text-gray-600">Name</p>
                    <p className="text-gray-900">{candidate.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="mb-1 text-gray-600">Position</p>
                    <p className="text-gray-900">{candidate.target_position}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="mb-1 text-gray-600">Email</p>
                    <p className="text-gray-900">{candidate.email_address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="mb-1 text-gray-600">Phone</p>
                    <p className="text-gray-900">{candidate.contact_phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT SIDE — Detailed Scores Only */}
        <div>
          <Card className="h-full p-6">
            <h2 className="mb-6">Detailed Assessment</h2>
            <div className="space-y-6">
              <ScoreItem
                label="Technical Skills"
                score={interviewResult.technical_skill}
              />
              <ScoreItem
                label="Problem Solving"
                score={interviewResult.problem_solving}
              />
              <ScoreItem
                label="Communication Skills"
                score={interviewResult.communication}
              />
              <ScoreItem
                label="Practical Experience"
                score={interviewResult.experience}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Strengths + Weaknesses */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-green-700">Strengths</h3>
          <ul className="space-y-3">
            {interviewResult.pros.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                <span className="text-gray-700">{s}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-red-700">Areas for Improvement</h3>
          <ul className="space-y-3">
            {interviewResult.cons.map((w, i) => (
              <li key={i} className="flex items-start gap-2">
                <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
                <span className="text-gray-700">{w}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function ScoreItem({ label, score }: { label: string; score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-gray-900">{label}</span>
        <span className={`${getScoreColor(score)}`}>{score}/100</span>
      </div>
      <Progress value={score} className="h-2" />
    </div>
  );
}

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, Mail, Phone, Briefcase } from "lucide-react";

interface InterviewResultProps {
  interviewee: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
  overallScore: number;
  passed: boolean;
  detailedScores: {
    technicalSkills: number;
    problemSolving: number;
    communicationSkill: number;
    practicalExperience: number;
    enthusiasmAttitude: number;
  };
  strengths: string[];
  weaknesses: string[];
}

export function InterviewResult({
  interviewee,
  overallScore,
  passed,
  detailedScores,
  strengths,
  weaknesses,
}: InterviewResultProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with Pass/Fail Indicator */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="mb-2">Interview Result</h1>
            <p className="text-gray-600">Assessment Report</p>
          </div>
          <div className="flex items-center gap-3">
            {passed ? (
              <>
                <CheckCircle2 className="w-12 h-12 text-green-600" />
                <Badge className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-lg">
                  PASSED
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="w-12 h-12 text-red-600" />
                <Badge className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-lg">
                  FAILED
                </Badge>
              </>
            )}
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Interviewee Information */}
        <div className="space-y-4">
          <h2 className="text-gray-900">Candidate Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 mb-1">Name</p>
              <p className="text-gray-900">{interviewee.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-gray-600 mb-1">Position</p>
                <p className="text-gray-900">{interviewee.position}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-gray-600 mb-1">Email</p>
                <p className="text-gray-900">{interviewee.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-gray-600 mb-1">Phone</p>
                <p className="text-gray-900">{interviewee.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Overall Score */}
      <Card className="p-6">
        <div className="text-center">
          <h2 className="mb-4">Overall Interview Score</h2>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div
              className={`text-6xl ${
                passed ? "text-green-600" : "text-red-600"
              }`}
            >
              {overallScore}
            </div>
            <div className="text-gray-500">/100</div>
          </div>
          <Progress
            value={overallScore}
            className="h-3"
          />
        </div>
      </Card>

      {/* Detailed Scores */}
      <Card className="p-6">
        <h2 className="mb-6">Detailed Assessment</h2>
        <div className="space-y-6">
          <ScoreItem
            label="Technical Skills"
            score={detailedScores.technicalSkills}
          />
          <ScoreItem
            label="Problem Solving"
            score={detailedScores.problemSolving}
          />
          <ScoreItem
            label="Communication Skills"
            score={detailedScores.communicationSkill}
          />
          <ScoreItem
            label="Practical Experience"
            score={detailedScores.practicalExperience}
          />
          <ScoreItem
            label="Enthusiasm & Working Attitude"
            score={detailedScores.enthusiasmAttitude}
          />
        </div>
      </Card>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="mb-4 text-green-700">Strengths</h3>
          <ul className="space-y-3">
            {strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-red-700">Areas for Improvement</h3>
          <ul className="space-y-3">
            {weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{weakness}</span>
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
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-900">{label}</span>
        <span className={`${getScoreColor(score)}`}>{score}/100</span>
      </div>
      <Progress value={score} className="h-2" />
    </div>
  );
}

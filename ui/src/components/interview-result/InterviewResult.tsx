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
  InterviewSummary,
} from "@/features/interview-result/InterviewResult.types";

interface InterviewResultProps {
  candidate: Candidate;
  interviewSummary: InterviewSummary;
}

import { useLanguage } from "@/contexts/LanguageContext";

export function InterviewResult({
  candidate,
  interviewSummary,
}: InterviewResultProps) {
  const { t } = useLanguage();
  return (
    <div className="mx-auto w-full space-y-6 p-6">
      {/* FULL-WIDTH OVERALL SCORE */}
      <Card className="border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all duration-300 hover:bg-white/10 shadow-2xl">
        <div className="text-center">
          <h2 className="mb-4 text-xl font-medium tracking-tight text-slate-200">{t("overallScore")}</h2>
          <div className="mb-6 flex items-baseline justify-center gap-2">
            <span
              className={`text-7xl font-bold tracking-tighter ${interviewSummary.passed
                ? "bg-gradient-to-br from-green-400 to-emerald-500 bg-clip-text text-transparent"
                : "bg-gradient-to-br from-red-400 to-pink-600 bg-clip-text text-transparent"
                }`}
            >
              {interviewSummary.overall_score}
            </span>
            <span className="text-2xl font-light text-slate-500">/100</span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/5 border border-white/10">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${interviewSummary.passed
                ? "bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                }`}
              style={{ width: `${interviewSummary.overall_score}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* LEFT SIDE — AI HR Assistant & Candidate Profile */}
        <div className="h-full space-y-6">
          <Card className="flex h-full flex-col justify-between border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-xl">
            {/* Header with Pass/Fail */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="mb-1 text-2xl font-bold tracking-tight text-white">
                    {t("aiHRAssistant")}
                  </h1>
                  <p className="font-medium text-emerald-400/80">{t("assessmentReport")}</p>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className={`rounded-full p-2 ${interviewSummary.passed ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                    }`}>
                    {interviewSummary.passed ? (
                      <CheckCircle2 className="h-8 w-8" />
                    ) : (
                      <XCircle className="h-8 w-8" />
                    )}
                  </div>
                  <Badge className={`border-0 px-4 py-1 text-sm font-bold uppercase tracking-wider text-white shadow-lg ${interviewSummary.passed
                    ? "bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-600"
                    : "bg-red-500 shadow-red-500/20 hover:bg-red-600"
                    }`}>
                    {interviewSummary.passed ? t("passed") : t("failed")}
                  </Badge>
                </div>
              </div>

              <Separator className="mb-8 bg-white/10" />
            </div>

            {/* Candidate Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <InfoField icon={<User className="h-4 w-4" />} label={t("name")} value={candidate.name} />
              <InfoField icon={<Briefcase className="h-4 w-4" />} label={t("jobTitle")} value={candidate.target_position} />
              <InfoField icon={<Mail className="h-4 w-4" />} label={t("email")} value={candidate.email_address} />
              <InfoField icon={<Phone className="h-4 w-4" />} label={t("phone")} value={candidate.contact_phone} />
            </div>
          </Card>
        </div>

        {/* RIGHT SIDE — Detailed Assessment */}
        <div>
          <Card className="h-full border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-xl">
            <h2 className="mb-8 text-xl font-semibold text-slate-200">
              {t("detailedAssessment")}
            </h2>
            <div className="space-y-8">
              <ScoreItem
                label={t("technicalSkills")}
                score={interviewSummary.technical_skill}
                gradient="from-blue-500 to-cyan-400"
              />
              <ScoreItem
                label={t("problemSolving")}
                score={interviewSummary.problem_solving}
                gradient="from-purple-500 to-pink-400"
              />
              <ScoreItem
                label={t("communicationSkills")}
                score={interviewSummary.communication}
                gradient="from-amber-500 to-orange-400"
              />
              <ScoreItem
                label={t("practicalExperience")}
                score={interviewSummary.experience}
                gradient="from-indigo-500 to-blue-400"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Strengths + Weaknesses */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-emerald-400">{t("strengths")}</h3>
          </div>
          <ul className="space-y-4">
            {interviewSummary.pros.map((s, i) => (
              <li key={i} className="group flex items-start gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 transition-transform group-hover:scale-150" />
                <span className="leading-relaxed text-slate-300">{s}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-red-500/10 p-2">
              <XCircle className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-red-400">{t("areasForImprovement")}</h3>
          </div>
          <ul className="space-y-4">
            {interviewSummary.cons.map((w, i) => (
              <li key={i} className="group flex items-start gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500 transition-transform group-hover:scale-150" />
                <span className="leading-relaxed text-slate-300">{w}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Summary Section — Fullwidth at the end */}
      {interviewSummary.summary && (
        <Card className="border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-xl italic">
          <p className="text-center text-lg text-slate-400">
            &ldquo;{interviewSummary.summary}&rdquo;
          </p>
        </Card>
      )}
    </div>
  );
}

function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 rounded-md bg-white/5 p-1.5 text-slate-400 font-medium">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="font-medium text-slate-200">{value || "—"}</p>
      </div>
    </div>
  );
}

function ScoreItem({
  label,
  score,
  gradient
}: {
  label: string;
  score: number;
  gradient: string;
}) {
  return (
    <div className="group">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-medium text-slate-300 transition-colors group-hover:text-white">{label}</span>
        <span className="rounded-md bg-white/10 px-2 py-0.5 text-sm font-bold tracking-tighter text-slate-100">
          {score}<span className="ml-0.5 text-[10px] uppercase tracking-tighter text-slate-500">/100</span>
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

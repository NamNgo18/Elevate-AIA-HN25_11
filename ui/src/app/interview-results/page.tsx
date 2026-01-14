"use client";

import { useEffect, useState, useRef } from "react";
import { InterviewResult } from "@/components/interview-result/InterviewResult";
import { useInterviewResult } from "@/features/interview-result/useInterviewResult";
import { CandidateData } from "@/features/interview-result/InterviewResult.types";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getApiUrl } from "@/lib/api";

import { useLanguage } from "@/contexts/LanguageContext";

function InterviewResultPage() {
  const { t } = useLanguage();
  const { interviewReport, loading, generateResult } = useInterviewResult();

  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [isDeleting, setIsDeleting] = useState(false);

  const hasCalledRef = useRef(false);

  useEffect(() => {
    if (!sessionId) return;
    if (hasCalledRef.current) return;

    hasCalledRef.current = true;
    generateResult(sessionId).catch((err) =>
      console.error("Failed to generate interview result:", err),
    );
  }, [sessionId, generateResult]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-8 flex flex-col items-center justify-center text-white">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-800/15 via-transparent to-transparent pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-800/15 via-transparent to-transparent pointer-events-none" />

        <div className="relative flex flex-col items-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500" />
          <p className="text-slate-400">{t("generatingInterviewResult")}</p>
        </div>
      </div>
    );
  }

  if (!interviewReport || !sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-8 flex items-center justify-center text-white">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-800/15 via-transparent to-transparent pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-800/15 via-transparent to-transparent pointer-events-none" />

        <p className="relative text-slate-400">{t("noInterviewData")}</p>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!sessionId || !confirm(t("deleteReportConfirm"))) return;

    setIsDeleting(true);
    try {
      const response = await fetch(getApiUrl(`routes/report/${sessionId}`), {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success(t("reportDeleted"));
      router.push("/interview-reports");
    } catch (err: any) {
      toast.error(t("failedToDeleteReport"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-8 selection:bg-purple-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-800/15 via-transparent to-transparent pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-800/15 via-transparent to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-7xl animate-fadeIn">
        <div className="mb-6 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => router.push("/interview-reports")}
            className="gap-2 border-white/20 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("details")} / {t("interviewReports")}
          </Button>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0 shadow-lg shadow-red-500/30 transition-all duration-300 hover:scale-105"
          >
            {isDeleting ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {t("delete")}
          </Button>
        </div>
        <InterviewResult
          candidate={interviewReport.candidate}
          interviewSummary={interviewReport.interview_summary}
        />
      </div>
    </div>
  );
}

export default InterviewResultPage;

import { useState, useEffect, useMemo } from "react";
import { getApiUrl } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input"; // Thêm Input cho thanh search
import { Button } from "@/components/ui/button";
import { CandidateCard } from "./CandidateCard";
import { Loader2, Search, RotateCw } from "lucide-react"; // Thêm Search icon
import { DialogDetailCV } from "./DialogDetailCV";

// --- INTERFACES ---
interface CandidateResult {
  key: string;
  cv_id: string;
  job_title: string;
  name: string;
  phone_number: string;
  email: string;
  work: string;
  education: string;
  skills: string;
  awards: string;
  match_score: number;
  explanation: string;
  missing_skills: string[];
}

interface Candidate {
  key: string;
  name: string;
  phone_number: string;
  email: string;
  suitabilityScore: number;
}

interface FindCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobDescription: { jd_id: string } | null;
}

const mockCandidateDetail = (cv_id: string, name: string, email: string, phone_number: string, match_score: number): Candidate => ({
  key: cv_id,
  name: `${name}`,
  email: `${email}`,
  phone_number: `${phone_number}`,
  suitabilityScore: Math.round(match_score * 100) / 100,
});

import { useLanguage } from "@/contexts/LanguageContext";

export function FindCandidateDialog({
  open,
  onOpenChange,
  jobDescription,
}: FindCandidateDialogProps) {
  const { t } = useLanguage();

  // State to store the list of candidates (used for CandidateCard)
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  // State to store the entire API data (used for detailed lookup)
  const [allCandidateResults, setAllCandidateResults] = useState<CandidateResult[]>([]);

  // State to store the search term
  const [searchTerm, setSearchTerm] = useState("");

  // State to manage detail dialog
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<{ candidate: CandidateResult } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jdId, setJdId] = useState<string>();


  // Function to call the API
  const fetchCandidates = async (jd_id: string) => {
    setIsLoading(true);
    setError(null);
    // Reset search term when a new job is loaded
    setSearchTerm("");
    try {
      const response = await fetch(getApiUrl(`api/batch-match?jd_id=${jd_id}`));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results: CandidateResult[] = await response.json();
      const data: CandidateResult[] = results.sort((a, b) => b.match_score - a.match_score);

      // STORE ALL DATA FOR LATER DETAIL RETRIEVAL
      setAllCandidateResults(data);

      // Map data from API to Candidate format (used for Card view)
      const mappedCandidates: Candidate[] = data.map(result =>
        mockCandidateDetail(result.cv_id, result.name, result.email, result.phone_number, result.match_score)
      );

      setCandidates(mappedCandidates);
      setJdId(jd_id);
    } catch (err) {
      console.error("Could not fetch candidates:", err);
      setError(t("failedToDownload"));
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect to call the API
  useEffect(() => {
    if (open && jobDescription?.jd_id) {
      fetchCandidates(jobDescription.jd_id);
    }
  }, [open, jobDescription, t]);

  // Filter candidates based on the search term
  const filteredCandidates = useMemo(() => {
    if (!searchTerm) {
      return candidates;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return candidates.filter(candidate =>
      candidate.name.toLowerCase().includes(lowerCaseSearch) ||
      candidate.email.toLowerCase().includes(lowerCaseSearch) ||
      candidate.phone_number.includes(lowerCaseSearch)
    );
  }, [candidates, searchTerm]);


  const handleContact = (candidate: Candidate) => {
    window.location.href = `mailto:${candidate.email}`;
  };

  // Function to handle detail click event
  const handleViewDetail = (candidateBase: Candidate) => {
    // 1. Find the full CandidateResult based on the key (cv_id)
    const detailResult = allCandidateResults.find(
      (r) => r.cv_id === candidateBase.key
    );

    if (detailResult) {
      // 2. Update state with the detailed data
      setSelectedCandidateDetail({ candidate: detailResult });
      // 3. Open the detail Dialog
      setIsDetailDialogOpen(true);
    } else {
      console.error("Detail data not found for CV ID:", candidateBase.key);
    }
  };
  // ---------------------------------------

  return (
    <>
      {/* 1. CANDIDATE LIST DIALOG */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-h-[90vh] w-[60vw] max-w-[60vw] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-white/20 p-0 overflow-hidden shadow-2xl"
          style={{ width: '60vw', maxWidth: '60vw' }}
        >
          <div className="p-8 border-b border-white/10 bg-white/5 backdrop-blur-xl">
            <DialogHeader>
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/30">
                    <Search className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-white">{t("suitableCandidates")}</DialogTitle>
                    <DialogDescription className="text-slate-400 mt-1">
                      {jobDescription
                        ? `${t("topMatches")} ${jobDescription.jd_id}`
                        : t("topMatches")}
                    </DialogDescription>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => jobDescription?.jd_id && fetchCandidates(jobDescription.jd_id)}
                  disabled={isLoading}
                  className="bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl gap-2 transition-all duration-300"
                >
                  <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {t("refresh")}
                </Button>
              </div>
            </DialogHeader>

            {/* ⭐️ SEARCH BAR FOR CANDIDATES */}
            <div className="relative mt-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 h-14 bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-2xl transition-all duration-300 shadow-inner"
              />
            </div>
          </div>

          <ScrollArea className="h-[60vh] p-8">
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-purple-500/10 border-t-purple-500 animate-spin" />
                    <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-purple-400 animate-bounce" />
                  </div>
                  <span className="text-xl font-medium text-slate-300 mt-6">{t("findingCandidates")}</span>
                  <p className="text-slate-500 mt-2">Checking our database for the best talent...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-64 bg-red-500/5 rounded-3xl border border-red-500/20 p-8">
                  <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-red-500" />
                  </div>
                  <div className="text-center text-red-400 font-medium text-lg">
                    {error}
                  </div>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 bg-white/5 rounded-3xl border border-white/10 border-dashed p-8">
                  <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <div className="text-center text-slate-400 text-lg font-medium">
                    {searchTerm
                      ? `${t("noMatchSearch")} "${searchTerm}"`
                      : t("noCandidatesFound")}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredCandidates.map((candidate) => (
                    <CandidateCard
                      key={candidate.key}
                      candidate={candidate}
                      onContact={handleContact}
                      onDetail={handleViewDetail}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* 2. CANDIDATE DETAIL DIALOG */}
      <DialogDetailCV
        jdId={jdId}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        Candidate={selectedCandidateDetail}
      />
    </>
  );
}
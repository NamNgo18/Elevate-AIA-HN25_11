import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CandidateCard } from "./CandidateCard";
import { Loader2 } from "lucide-react";
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

export function FindCandidateDialog({
  open,
  onOpenChange,
  jobDescription,
}: FindCandidateDialogProps) {

  // State to store the list of candidates (used for CandidateCard)
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  // State to store the entire API data (used for detailed lookup)
  const [allCandidateResults, setAllCandidateResults] = useState<CandidateResult[]>([]);

  // --- ADD STATE TO MANAGE DETAIL DIALOG ---
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<{ candidate: CandidateResult } | null>(null);
  // ---------------------------------------------

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // 2. useEffect to call the API
  useEffect(() => {
    if (open && jobDescription?.jd_id) {
      const fetchCandidates = async (jd_id: string) => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`http://localhost:8000/api/batch-match?jd_id=${jd_id}`);

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
        } catch (err) {
          console.error("Could not fetch candidates:", err);
          setError("Failed to load candidates. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchCandidates(jobDescription.jd_id);
    }
  }, [open, jobDescription]);

  const handleContact = (candidate: Candidate) => {
    window.location.href = `mailto:${candidate.email}`;
  };

  // --- FUNCTION TO HANDLE DETAIL CLICK EVENT ---
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
        <DialogContent className="max-h-[80vh] max-w-4xl">
          <DialogHeader>
            <DialogTitle>Suitable Candidates</DialogTitle>
            <DialogDescription>
              {jobDescription
                ? `Top matches for Job ID: ${jobDescription.jd_id}`
                : "Top candidate matches"}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-[500px]">
                  <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                  <span className="text-lg">Finding candidates...</span>
                </div>
              ) : error ? (
                <div className="text-center text-red-500 p-4 border rounded">
                  {error}
                </div>
              ) : candidates.length === 0 ? (
                <div className="text-center text-gray-500 p-4">
                  No suitable candidates found for this job.
                </div>
              ) : (
                candidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.key}
                    candidate={candidate}
                    onContact={handleContact}
                    onDetail={handleViewDetail}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* 2. CANDIDATE DETAIL DIALOG */}
      <DialogDetailCV
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        Candidate={selectedCandidateDetail}
      />
    </>
  );
}
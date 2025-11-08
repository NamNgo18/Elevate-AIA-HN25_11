import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DetailCVCard } from "./DetailCVCard";
import { Loader2 } from "lucide-react";

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

interface DialogDetailCVProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    Candidate: { candidate: CandidateResult } | null;
}

export function DialogDetailCV({
    open,
    onOpenChange,
    Candidate,
}: DialogDetailCVProps) {
    // State to store the extracted candidate data
    const [candidateData, setCandidateData] = useState<CandidateResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (Candidate && Candidate.candidate) {
            // Extract CandidateResult data from the prop and update state
            setCandidateData(Candidate.candidate);
        } else {
            // Reset to null if the prop is null
            setCandidateData(null);
        }
        // Add Candidate to the dependency array to track changes
    }, [Candidate]);


    const handleContact = () => {
        console.log("Contact action triggered for:", candidateData?.name);
        // Add contact handling logic here
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[80vh] max-w-4xl p-0">
                <div className="p-6">
                    <DialogHeader>
                        <DialogTitle>Suitable Candidates</DialogTitle>
                        <DialogDescription>
                            {candidateData
                                ? `Candidate's information: ${candidateData.name}`
                                : "Top candidate matches"}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <ScrollArea className="h-[500px] px-6 pb-6">
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
                        ) : !candidateData ? ( // Check candidateData, not the Candidate prop
                            <div className="text-center text-gray-500 p-4">
                                No suitable candidates found for this job.
                            </div>
                        ) : (
                            // Pass the extracted candidateData
                            <DetailCVCard
                                candidate={candidateData}
                                onContact={handleContact}
                            />
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
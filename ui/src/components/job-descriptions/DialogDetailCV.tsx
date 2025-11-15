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

// --- INTERFACE DECLARATIONS ---

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
    jdId: string | undefined;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    Candidate: { candidate: CandidateResult } | null;
}

interface NotificationState {
    open: boolean;
    title: string;
    description: string;
    isError: boolean;
}

// --- MAIN COMPONENT ---

export function DialogDetailCV({
    jdId,
    open,
    onOpenChange,
    Candidate,
}: DialogDetailCVProps) {
    // Main states
    const [candidateData, setCandidateData] = useState<CandidateResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // New state for the notification result dialog
    const [notification, setNotification] = useState<NotificationState>({
        open: false,
        title: "",
        description: "",
        isError: false,
    });

    // Function to close the notification
    const closeNotification = () => {
        setNotification({ ...notification, open: false });
    };

    // useEffect to update candidate data when prop changes
    useEffect(() => {
        if (Candidate && Candidate.candidate) {
            setCandidateData(Candidate.candidate);
        } else {
            setCandidateData(null);
        }
    }, [Candidate]);

    // --- MAIL SENDING LOGIC ---

    const sendMail = async (
        receiver: string,
        cv_id: string | undefined,
        jd_id: string | undefined,
        setIsLoading: (loading: boolean) => void,
        setError: (error: string | null) => void
    ) => {

        // 1. Check receiver
        if (!receiver) {
            setNotification({
                open: true,
                title: "Missing Email Error",
                description: "Candidate's email address not found.",
                isError: true,
            });
            return;
        }

        // 2. Check required IDs (to create URL)
        if (!cv_id || !jd_id) {
            setNotification({
                open: true,
                title: "Missing Data Error",
                description: "Insufficient CV or JD ID to create interview link. Please check candidate data.",
                isError: true,
            });
            return;
        }

        // 3. Enable loading state
        setIsLoading(true);
        setError(null);

        // Construct URL with all 3 parameters
        const url = `http://127.0.0.1:8000/api/send_confirmation?receiver=${receiver}&cv_id=${cv_id}&jd_id=${jd_id}`;

        try {
            const response = await fetch(url, {
                method: 'POST', // Ensure POST is used
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok) {
                const successMessage = data.message || "Email sent successfully!";

                setNotification({
                    open: true,
                    title: "Email Sent Successfully",
                    description: successMessage,
                    isError: false,
                });
                return successMessage;
            } else {
                const errorMessage = data.error || "Unknown error from Server.";

                setNotification({
                    open: true,
                    title: "Email Sending Error",
                    description: `Details: ${errorMessage}`,
                    isError: true,
                });
                return errorMessage;
            }

        } catch (error) {
            const connectionError = "Network connection error or unable to process response from server.";

            setNotification({
                open: true,
                title: "System Error",
                description: connectionError,
                isError: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // --- MAIN CALL FUNCTION ---

    const handleContact = () => {
        const email = candidateData?.email;
        const jd_id = jdId;
        const cv_id = candidateData?.key;

        if (!email) {
            setNotification({
                open: true,
                title: "Missing Email Error",
                description: "No candidate email available to send.",
                isError: true,
            });
            return;
        }

        console.log("Contact action triggered for:", candidateData?.name);

        // Pass the IDs (potentially undefined)
        sendMail(email, cv_id, jd_id, setIsLoading, setError);
    };


    // --- RENDER SECTION ---

    return (
        // Use Fragment to contain both Dialogs (Main Dialog and Notification Dialog)
        <>
            {/* 1. MAIN DIALOG (CV Details) */}
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
                                    <span className="text-lg">Processing request...</span>
                                </div>
                            ) : error ? (
                                <div className="text-center text-red-500 p-4 border border-red-500 rounded">
                                    {error}
                                </div>
                            ) : !candidateData ? (
                                <div className="text-center text-gray-500 p-4">
                                    No suitable candidates found for this job.
                                </div>
                            ) : (
                                // Render DetailCVCard
                                <DetailCVCard
                                    candidate={candidateData}
                                    onContact={handleContact}
                                />
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* 2. NOTIFICATION DIALOG (Email Sending Result) */}
            <Dialog open={notification.open} onOpenChange={closeNotification}>
                <DialogContent className={`max-w-md`}>
                    <DialogHeader>
                        <DialogTitle className={notification.isError ? 'text-red-600' : 'text-green-600'}>
                            {notification.title}
                        </DialogTitle>
                        <DialogDescription>
                            {notification.description}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    );
}
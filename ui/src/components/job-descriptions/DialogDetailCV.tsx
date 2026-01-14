import { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DetailCVCard } from "./DetailCVCard";
import { Loader2, NotebookTabs } from "lucide-react";

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

import { useLanguage } from "@/contexts/LanguageContext";

export function DialogDetailCV({
    jdId,
    open,
    onOpenChange,
    Candidate,
}: DialogDetailCVProps) {
    const { t, language } = useLanguage();
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
                title: t("error"),
                description: t("error"), // Fallback if no specific key
                isError: true,
            });
            return;
        }

        // 2. Check required IDs (to create URL)
        if (!cv_id || !jd_id) {
            setNotification({
                open: true,
                title: t("error"),
                description: t("failedToDownload"),
                isError: true,
            });
            return;
        }

        // 3. Enable loading state
        setIsLoading(true);
        setError(null);

        // Construct URL with all 4 parameters
        const url = getApiUrl(`api/send_confirmation?receiver=${receiver}&cv_id=${cv_id}&jd_id=${jd_id}&lang=${language}`);

        try {
            const response = await fetch(url, {
                method: 'POST', // Ensure POST is used
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok) {
                const successMessage = data.message || t("success");

                setNotification({
                    open: true,
                    title: t("success"),
                    description: successMessage,
                    isError: false,
                });
                return successMessage;
            } else {
                const errorMessage = data.error || t("error");

                setNotification({
                    open: true,
                    title: t("error"),
                    description: `Details: ${errorMessage}`,
                    isError: true,
                });
                return errorMessage;
            }

        } catch (error) {
            const connectionError = t("error");

            setNotification({
                open: true,
                title: t("error"),
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
                title: t("error"),
                description: t("error"),
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
                <DialogContent
                    className="max-h-[90vh] w-[60vw] max-w-[60vw] bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-white/20 p-0 overflow-hidden shadow-2xl"
                    style={{ width: '60vw', maxWidth: '60vw' }}
                >
                    <div className="p-8 border-b border-white/10 bg-white/5 backdrop-blur-xl">
                        <DialogHeader>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                                    <NotebookTabs className="h-6 w-6 text-blue-400" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-bold text-white">{t("suitableCandidates")}</DialogTitle>
                                    <DialogDescription className="text-slate-400 mt-1">
                                        {candidateData
                                            ? `${t("candidateInfo")} ${candidateData.name}`
                                            : t("suitableCandidates")}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <ScrollArea className="h-[65vh] p-8">
                        <div className="space-y-6">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-64">
                                    <div className="relative">
                                        <div className="h-16 w-16 rounded-full border-4 border-blue-500/10 border-t-blue-500 animate-spin" />
                                        <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-400 animate-bounce" />
                                    </div>
                                    <span className="text-xl font-medium text-slate-300 mt-6">{t("processing")}</span>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-64 bg-red-500/5 rounded-3xl border border-red-500/20 p-8 text-center text-red-400">
                                    {error}
                                </div>
                            ) : !candidateData ? (
                                <div className="flex flex-col items-center justify-center h-64 bg-white/5 rounded-3xl border border-white/10 border-dashed p-8 text-center text-slate-400">
                                    {t("noCandidatesFound")}
                                </div>
                            ) : (
                                // Render DetailCVCard
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <DetailCVCard
                                        candidate={candidateData}
                                        onContact={handleContact}
                                    />
                                </div>
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
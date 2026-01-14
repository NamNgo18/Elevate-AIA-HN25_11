import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, NotebookTabs, BookOpenText, Target, Award } from "lucide-react"; // Thêm icons

interface Candidate {
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

interface DetailCVCardProps {
    candidate: Candidate;
    onContact: (candidate: Candidate) => void;
}

import { useLanguage } from "@/contexts/LanguageContext";

export function DetailCVCard({ candidate, onContact }: DetailCVCardProps) {
    const { t } = useLanguage();
    const getScoreColor = (score: number) => {
        if (score >= 90) return "from-green-500 to-emerald-600 shadow-green-500/20";
        if (score >= 80) return "from-blue-500 to-indigo-600 shadow-blue-500/20";
        if (score >= 70) return "from-yellow-500 to-orange-600 shadow-yellow-500/20";
        return "from-slate-500 to-slate-600 shadow-slate-500/20";
    };

    return (
        <Card className="bg-white/5 border-white/10 shadow-2xl overflow-hidden rounded-3xl">
            <CardContent className="p-8 space-y-8">

                {/* 1. HEADER & SCORE */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                    <div className="flex-1">
                        <h3 className="text-3xl font-extrabold text-white mb-1">{candidate.name}</h3>
                        <p className="text-lg text-purple-400 font-medium">{candidate.job_title}</p>
                    </div>

                    <Badge
                        className={`bg-gradient-to-r ${getScoreColor(candidate.match_score)} text-white text-xl px-6 py-3 font-black rounded-2xl shadow-lg border-0`}
                    >
                        {candidate.match_score}% Match
                    </Badge>
                </div>

                {/* 2. CONTACT & EXPLANATION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <h4 className="text-lg font-bold text-slate-300 flex items-center gap-2">
                            <Target className="h-5 w-5 text-yellow-400" />
                            {t("assessmentSummary")}
                        </h4>
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400" />
                            <p className="text-slate-300 leading-relaxed italic relative z-10">
                                "{candidate.explanation}"
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 group">
                                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                                    <Mail className="h-5 w-5 text-blue-400" />
                                </div>
                                <span className="text-slate-300 font-medium truncate">{candidate.email && candidate.email !== "null" ? candidate.email : t("notProvided")}</span>
                            </div>
                            <div className="flex items-center gap-3 group">
                                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                                    <Phone className="h-5 w-5 text-emerald-400" />
                                </div>
                                <span className="text-slate-300 font-medium truncate">{candidate.phone_number && candidate.phone_number !== "null" ? candidate.phone_number : t("notProvided")}</span>
                            </div>
                        </div>

                        <Button
                            onClick={() => onContact(candidate)}
                            className="w-full h-14 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <Mail className="mr-2 h-5 w-5" />
                            {t("contactCandidate")}
                        </Button>
                    </div>
                </div>

                {/* 3. CORE DETAILS (WORK, EDUCATION, SKILLS) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    {/* Work / Experience */}
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                        <h4 className="flex items-center gap-3 text-xl font-bold text-blue-400 mb-4">
                            <NotebookTabs className="h-6 w-6" /> {t("experience")}
                        </h4>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {candidate.work && candidate.work !== "null" ? candidate.work : t("notProvided")}
                        </p>
                    </div>

                    {/* Education */}
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                        <h4 className="flex items-center gap-3 text-xl font-bold text-cyan-400 mb-4">
                            <BookOpenText className="h-6 w-6" /> {t("education")}
                        </h4>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {candidate.education && candidate.education !== "null" ? candidate.education : t("notProvided")}
                        </p>
                    </div>

                    {/* Skills */}
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                        <h4 className="flex items-center gap-3 text-xl font-bold text-indigo-400 mb-4">
                            <Target className="h-6 w-6" /> {t("skills")}
                        </h4>
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {candidate.skills && candidate.skills !== "null" ? candidate.skills : t("notProvided")}
                        </p>
                    </div>

                    {/* Missing Skills */}
                    <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/20 hover:bg-red-500/10 transition-colors">
                        <h4 className="flex items-center gap-3 text-xl font-bold text-red-400 mb-4">
                            <Award className="h-6 w-6" /> {t("missingSkills")}
                        </h4>
                        {candidate.missing_skills && candidate.missing_skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {candidate.missing_skills.map((skill, index) => (
                                    <Badge key={index} variant="destructive" className="bg-red-500/20 text-red-300 border border-red-500/30 font-semibold px-3 py-1.5 rounded-xl">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm font-medium italic">{t("noMissingSkills")}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
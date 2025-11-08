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

export function DetailCVCard({ candidate, onContact }: DetailCVCardProps) {
    const getScoreColor = (score: number) => {
        if (score >= 90) return "bg-green-600";
        if (score >= 80) return "bg-blue-600";
        if (score >= 70) return "bg-yellow-600";
        return "bg-gray-600";
    };

    return (
        <Card className="shadow-lg border-2 border-indigo-100 max-w-md mx-auto">
            <CardContent className="p-6 space-y-5">

                {/* 1. HEADER & SCORE */}
                <div className="flex items-start justify-between border-b pb-4">
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900">{candidate.name}</h3>
                        <p className="text-md text-indigo-700 font-medium">{candidate.job_title}</p>
                    </div>

                    <Badge
                        className={`${getScoreColor(candidate.match_score)} text-white text-lg px-4 py-2 font-extrabold`}
                    >
                        {candidate.match_score}% Match
                    </Badge>
                </div>

                {/* 2. CONTACT & EXPLANATION */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Tóm tắt Đánh giá</h4>
                    <p className="text-gray-700 italic border-l-4 border-yellow-400 pl-3 mb-4">
                        {candidate.explanation}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-600 space-y-2 sm:space-y-0">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-indigo-500" />
                                <span>{candidate.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-indigo-500" />
                                <span>{candidate.phone_number}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-600 space-y-2 sm:space-y-0">
                        <div className="flex items-center gap-4">
                            <Button onClick={() => onContact(candidate)}>
                                Contact Candidate
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 3. CORE DETAILS (WORK, EDUCATION, SKILLS) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* Work / Experience */}
                    <div>
                        <h4 className="flex items-center gap-2 text-xl font-semibold text-indigo-700 border-b-2 border-indigo-200 pb-1 mb-3">
                            <NotebookTabs className="h-5 w-5" /> Kinh nghiệm
                        </h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{candidate.work || "N/A"}</p>
                    </div>

                    {/* Education */}
                    <div>
                        <h4 className="flex items-center gap-2 text-xl font-semibold text-indigo-700 border-b-2 border-indigo-200 pb-1 mb-3">
                            <BookOpenText className="h-5 w-5" /> Học vấn
                        </h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{candidate.education || "N/A"}</p>
                    </div>

                    {/* Skills */}
                    <div>
                        <h4 className="flex items-center gap-2 text-xl font-semibold text-indigo-700 border-b-2 border-indigo-200 pb-1 mb-3">
                            <Target className="h-5 w-5" /> Kỹ năng
                        </h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{candidate.skills || "N/A"}</p>
                    </div>

                    {/* Missing Skills */}
                    <div>
                        <h4 className="flex items-center gap-2 text-xl font-semibold text-red-600 border-b-2 border-red-200 pb-1 mb-3">
                            <Award className="h-5 w-5" /> Kỹ năng còn thiếu
                        </h4>
                        {candidate.missing_skills && candidate.missing_skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {candidate.missing_skills.map((skill, index) => (
                                    <Badge key={index} variant="destructive" className="bg-red-100 text-red-800">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">Không có kỹ năng quan trọng nào bị thiếu.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
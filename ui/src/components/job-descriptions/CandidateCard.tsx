import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Briefcase } from "lucide-react";

interface Candidate {
  key: string;
  name: string;
  phone_number: string;
  email: string;
  suitabilityScore: number;
}

interface CandidateCardProps {
  candidate: Candidate;
  onContact: (candidate: Candidate) => void;
  onDetail: (candidate: Candidate) => void;
}

import { useLanguage } from "@/contexts/LanguageContext";

export function CandidateCard({ candidate, onContact, onDetail }: CandidateCardProps) {
  const { t } = useLanguage();
  const getScoreColor = (score: number) => {
    if (score >= 90) return "from-green-500 to-emerald-600 shadow-green-500/20";
    if (score >= 80) return "from-blue-500 to-indigo-600 shadow-blue-500/20";
    if (score >= 70) return "from-yellow-500 to-orange-600 shadow-yellow-500/20";
    return "from-slate-500 to-slate-600 shadow-slate-500/20";
  };

  return (
    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] shadow-xl group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-4 flex items-center gap-3">
              <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">{candidate.name}</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-300 transition-colors">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-sm font-medium">{candidate.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-300 transition-colors">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-sm font-medium">{candidate.phone_number}</span>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <Button
                  onClick={() => onDetail(candidate)}
                  className="bg-white/10 hover:bg-white/20 border-white/10 text-white rounded-xl px-6 h-10 transition-all active:scale-95"
                  variant="outline"
                >
                  <Briefcase className="mr-2 h-4 w-4 text-purple-400" />
                  {t("details")}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge
              className={`bg-gradient-to-r ${getScoreColor(candidate.suitabilityScore)} border-0 text-white font-bold py-2 px-4 rounded-xl shadow-lg`}
            >
              {candidate.suitabilityScore}% Match
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

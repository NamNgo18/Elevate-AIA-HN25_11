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

export function CandidateCard({ candidate, onContact, onDetail }: CandidateCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 80) return "bg-blue-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-gray-500";
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="py-1/2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-3">
              <h3 className="text-gray-900">{candidate.name}</h3>
            </div>

            <div className="space-y-2 text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{candidate.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{candidate.phone_number}</span>
              </div>
              <div className="mt-6 flex items-center gap-2">
                <Button onClick={() => onDetail(candidate)}>Detail</Button>
              </div>
            </div>
          </div>

          <Badge
            className={`${getScoreColor(candidate.suitabilityScore)} text-white`}
          >
            {candidate.suitabilityScore}% Match
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

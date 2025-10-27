import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Briefcase } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  yearsOfExp: number;
  suitabilityScore: number;
}

interface CandidateCardProps {
  candidate: Candidate;
  onContact: (candidate: Candidate) => void;
}

export function CandidateCard({ candidate, onContact }: CandidateCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-gray-900">{candidate.name}</h3>
              <Badge className={`${getScoreColor(candidate.suitabilityScore)} text-white`}>
                {candidate.suitabilityScore}% Match
              </Badge>
            </div>
            
            <div className="space-y-2 text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{candidate.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{candidate.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span>{candidate.yearsOfExp} years of experience</span>
              </div>
            </div>
          </div>

          <Button onClick={() => onContact(candidate)} className="ml-4">
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

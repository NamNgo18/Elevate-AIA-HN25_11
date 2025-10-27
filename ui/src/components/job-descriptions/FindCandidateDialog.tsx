import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CandidateCard } from "./CandidateCard";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  yearsOfExp: number;
  suitabilityScore: number;
}

interface FindCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobDescription: { name: string } | null;
}

const mockCandidates: Candidate[] = [
  {
    id: "1",
    name: "Alex Thompson",
    email: "alex.thompson@email.com",
    phone: "+1 (555) 123-4567",
    yearsOfExp: 7,
    suitabilityScore: 95,
  },
  {
    id: "2",
    name: "Jordan Lee",
    email: "jordan.lee@email.com",
    phone: "+1 (555) 234-5678",
    yearsOfExp: 5,
    suitabilityScore: 88,
  },
  {
    id: "3",
    name: "Taylor Martinez",
    email: "taylor.martinez@email.com",
    phone: "+1 (555) 345-6789",
    yearsOfExp: 6,
    suitabilityScore: 85,
  },
  {
    id: "4",
    name: "Casey Brown",
    email: "casey.brown@email.com",
    phone: "+1 (555) 456-7890",
    yearsOfExp: 4,
    suitabilityScore: 82,
  },
  {
    id: "5",
    name: "Morgan Davis",
    email: "morgan.davis@email.com",
    phone: "+1 (555) 567-8901",
    yearsOfExp: 8,
    suitabilityScore: 79,
  },
  {
    id: "6",
    name: "Riley Wilson",
    email: "riley.wilson@email.com",
    phone: "+1 (555) 678-9012",
    yearsOfExp: 3,
    suitabilityScore: 75,
  },
];

export function FindCandidateDialog({
  open,
  onOpenChange,
  jobDescription,
}: FindCandidateDialogProps) {
  const handleContact = (candidate: Candidate) => {
    window.location.href = `mailto:${candidate.email}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle>Suitable Candidates</DialogTitle>
          <DialogDescription>
            {jobDescription
              ? `Top matches for ${jobDescription.name}`
              : "Top candidate matches"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {mockCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onContact={handleContact}
              />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

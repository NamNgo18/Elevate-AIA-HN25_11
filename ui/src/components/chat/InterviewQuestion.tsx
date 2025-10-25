import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InterviewQuestionProps {
  question: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tips?: string[];
}

export function InterviewQuestion({ question, category, difficulty, tips }: InterviewQuestionProps) {
  const difficultyColors = {
    Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle>Interview Question</CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">{category}</Badge>
            <Badge className={difficultyColors[difficulty]}>{difficulty}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-foreground">{question}</p>
        </div>
        {tips && tips.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-muted-foreground">Tips:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Trash2 } from "lucide-react";

interface AnswerRecorderProps {
  onSaveAnswer?: (answer: string) => void;
  onClear?: () => void;
}

export function AnswerRecorder({ onSaveAnswer, onClear }: AnswerRecorderProps) {
  const [answer, setAnswer] = useState("");

  const handleSave = () => {
    if (answer.trim()) {
      onSaveAnswer?.(answer);
    }
  };

  const handleClear = () => {
    setAnswer("");
    onClear?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Answer</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Type your answer here... Think about your approach, explain your reasoning, and be specific with examples."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="min-h-[200px] resize-none"
        />
        <div className="text-muted-foreground mt-2 text-sm">
          {answer.length} characters
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={handleSave} disabled={!answer.trim()}>
          <Save className="mr-2 h-4 w-4" />
          Save Answer
        </Button>
        <Button variant="outline" onClick={handleClear}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </CardFooter>
    </Card>
  );
}

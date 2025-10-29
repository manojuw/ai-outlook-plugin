import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Send, RefreshCw, Edit3, Loader2 } from "lucide-react";
import type { AIResponse } from "@shared/schema";

interface ResponseComposerProps {
  response: AIResponse;
  isGenerating?: boolean;
  onRegenerate?: () => void;
  onSend?: (response: string, answers: Record<string, string>) => void;
}

export function ResponseComposer({ response, isGenerating, onRegenerate, onSend }: ResponseComposerProps) {
  const [editedResponse, setEditedResponse] = useState(response.draftResponse);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Reset state when response changes, but preserve answers for persisting questions
  useEffect(() => {
    setEditedResponse(response.draftResponse);
    
    // Reset answers based on dynamic questions
    if (response.dynamicQuestions && response.dynamicQuestions.length > 0) {
      const newQuestionIds = new Set(response.dynamicQuestions.map(q => q.id));
      const preservedAnswers: Record<string, string> = {};
      
      // Keep answers for questions that still exist
      Object.entries(answers).forEach(([id, answer]) => {
        if (newQuestionIds.has(id)) {
          preservedAnswers[id] = answer;
        }
      });
      
      setAnswers(preservedAnswers);
    } else {
      // Clear all answers if no questions present
      setAnswers({});
    }
    
    setIsEditing(false);
  }, [response]);

  const handleSend = () => {
    if (onSend) {
      onSend(editedResponse, answers);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">AI-Generated Response</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="h-8"
            data-testid="button-edit-response"
          >
            <Edit3 className="w-3 h-3 mr-1" />
            {isEditing ? 'Preview' : 'Edit'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="h-8"
            data-testid="button-regenerate"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>
      </div>

      {isEditing ? (
        <Textarea
          value={editedResponse}
          onChange={(e) => setEditedResponse(e.target.value)}
          className="min-h-32 text-sm resize-none"
          placeholder="Edit the response..."
          data-testid="textarea-response"
        />
      ) : (
        <div className="p-3 bg-muted/50 rounded-md border">
          <p className="text-sm whitespace-pre-wrap" data-testid="text-draft-response">
            {editedResponse}
          </p>
        </div>
      )}

      {response.context && (
        <div className="p-3 bg-accent/10 rounded-md border border-accent/20">
          <p className="text-xs text-muted-foreground mb-1">Context used:</p>
          <p className="text-xs">{response.context}</p>
        </div>
      )}

      {response.dynamicQuestions && response.dynamicQuestions.length > 0 && (
        <div className="space-y-3 pt-2 border-t">
          <p className="text-xs font-medium">Additional Questions for Customer</p>
          <div className="space-y-4">
            {response.dynamicQuestions.map((question) => (
              <div key={question.id} className="space-y-2" data-testid={`question-${question.id}`}>
                <Label className="text-sm">{question.question}</Label>
                {question.type === 'radio' && question.options && (
                  <RadioGroup
                    value={answers[question.id] || ''}
                    onValueChange={(value) =>
                      setAnswers({ ...answers, [question.id]: value })
                    }
                  >
                    {question.options.map((option, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${idx}`} />
                        <Label
                          htmlFor={`${question.id}-${idx}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleSend}
          disabled={isGenerating}
          className="flex-1"
          data-testid="button-send-response"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Response
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}

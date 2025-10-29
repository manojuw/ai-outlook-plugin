import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertCircle, Info } from "lucide-react";
import type { AIAnalysis } from "@shared/schema";

interface AIAnalysisSectionProps {
  analysis: AIAnalysis;
}

export function AIAnalysisSection({ analysis }: AIAnalysisSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-accent text-accent-foreground border-accent-border';
      case 'low':
        return 'bg-muted text-muted-foreground border-muted-border';
      default:
        return 'bg-secondary text-secondary-foreground border-secondary-border';
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'frustrated':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'satisfied':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="p-4 space-y-4 border-2 border-accent/50 bg-accent/5">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">AI Analysis</h3>
        {analysis.sentiment && (
          <Badge variant="outline" className="ml-auto">
            {getSentimentIcon(analysis.sentiment)}
            <span className="ml-1 capitalize">{analysis.sentiment}</span>
          </Badge>
        )}
      </div>

      {analysis.extractedOrderNumber && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" data-testid="badge-extracted-order">
            Order: {analysis.extractedOrderNumber}
          </Badge>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium">Communication Summary</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 text-xs"
            data-testid="button-expand-summary"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Expand
              </>
            )}
          </Button>
        </div>

        <div className={`space-y-2 ${!isExpanded ? 'line-clamp-3' : ''}`}>
          <ul className="space-y-1.5" data-testid="list-summary">
            {analysis.communicationSummary.map((item, index) => (
              <li key={index} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-primary mt-1">•</span>
                <span className="flex-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {analysis.recommendedActions.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-xs font-medium">Recommended Actions</p>
          <div className="space-y-2">
            {analysis.recommendedActions.map((action, index) => (
              <div
                key={index}
                className={`p-3 rounded-md border ${getPriorityColor(action.priority)}`}
                data-testid={`action-${index}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium flex-1">{action.action}</p>
                  <Badge variant="outline" className="capitalize text-xs">
                    {action.priority}
                  </Badge>
                </div>
                <p className="text-xs opacity-90">{action.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

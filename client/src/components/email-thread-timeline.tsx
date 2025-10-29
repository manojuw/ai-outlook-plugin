import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Building2, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { EmailThread } from "@shared/schema";

interface EmailThreadTimelineProps {
  emails: EmailThread[];
}

export function EmailThreadTimeline({ emails }: EmailThreadTimelineProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  if (emails.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-muted-foreground">No email history found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold">Email History</h3>
      <div className="space-y-3">
        {emails.map((email, index) => {
          const isExpanded = expandedIds.has(email.id);
          return (
            <Card
              key={email.id}
              className={`p-4 ${email.isFromOrganization ? 'border-l-4 border-l-primary' : ''}`}
              data-testid={`card-email-${index}`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {email.isFromOrganization ? (
                      <Building2 className="w-3 h-3 text-primary flex-shrink-0" />
                    ) : (
                      <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate" data-testid={`text-sender-${index}`}>
                        {email.sender}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {email.senderEmail}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0" data-testid={`text-timestamp-${index}`}>
                    {formatDistanceToNow(new Date(email.timestamp), { addSuffix: true })}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium line-clamp-1" data-testid={`text-subject-${index}`}>
                    {email.subject}
                  </p>
                  {!isExpanded ? (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {email.snippet}
                    </p>
                  ) : (
                    <div className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap" data-testid={`text-body-${index}`}>
                      {email.body}
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(email.id)}
                  className="w-full justify-center text-xs h-8"
                  data-testid={`button-expand-${index}`}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3 mr-1" />
                      Show full email
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

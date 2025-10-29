import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Truck, MapPin, Clock, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ShippingStatus } from "@shared/schema";

interface ShippingStatusTrackerProps {
  status?: ShippingStatus;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function ShippingStatusTracker({ status, isLoading, onRefresh }: ShippingStatusTrackerProps) {
  if (!status) {
    return null;
  }

  const hasIssue = status.issueType && status.issueType !== 'none';

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Shipment Tracking</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 w-8"
          data-testid="button-refresh-tracking"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {hasIssue && status.issue && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm" data-testid="text-shipping-issue">
            {status.issue}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <p className="text-xs text-muted-foreground">Current Status</p>
            <p className="text-sm font-medium" data-testid="text-current-status">
              {status.currentStatus}
            </p>
          </div>
          {status.location && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Location</p>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <p className="text-sm" data-testid="text-location">
                  {status.location}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Last Updated</p>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <p className="text-sm">
              {formatDistanceToNow(new Date(status.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>

        {status.timeline.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs font-medium">Tracking Timeline</p>
            <div className="space-y-3">
              {status.timeline.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-3 relative"
                  data-testid={`timeline-item-${index}`}
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted'}`} />
                    {index < status.timeline.length - 1 && (
                      <div className="w-px h-full bg-border my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <p className="text-sm font-medium">{item.status}</p>
                    <p className="text-xs text-muted-foreground">{item.location}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

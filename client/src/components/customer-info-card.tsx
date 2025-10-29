import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, User } from "lucide-react";
import type { CustomerInfo } from "@shared/schema";

interface CustomerInfoCardProps {
  customer: CustomerInfo;
}

export function CustomerInfoCard({ customer }: CustomerInfoCardProps) {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Customer Information</h3>
        </div>
        <Badge variant="secondary" className="text-xs" data-testid="badge-email-count">
          {customer.totalEmails} {customer.totalEmails === 1 ? 'email' : 'emails'}
        </Badge>
      </div>
      
      <div className="space-y-2">
        {customer.name && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground min-w-12">Name:</span>
            <span className="text-sm font-medium" data-testid="text-customer-name">{customer.name}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Mail className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm break-all" data-testid="text-customer-email">{customer.email}</span>
        </div>
      </div>
    </Card>
  );
}

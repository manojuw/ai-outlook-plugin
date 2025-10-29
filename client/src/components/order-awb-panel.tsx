import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, Loader2 } from "lucide-react";
import type { Order } from "@shared/schema";

interface OrderAWBPanelProps {
  order?: Order;
  isLoadingAWB?: boolean;
  onRetrieveAWB?: () => void;
}

export function OrderAWBPanel({ order, isLoadingAWB, onRetrieveAWB }: OrderAWBPanelProps) {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Order & Shipment Details</h3>
      </div>

      {order ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Order Number</p>
            <p className="text-sm font-medium" data-testid="text-order-number">
              {order.orderNumber}
            </p>
          </div>

          {order.awbNumber ? (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">AWB Number</p>
              <div className="flex items-center gap-2">
                <Truck className="w-3 h-3 text-primary" />
                <p className="text-sm font-medium" data-testid="text-awb-number">
                  {order.awbNumber}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">AWB Number</p>
              <Button
                size="sm"
                onClick={onRetrieveAWB}
                disabled={isLoadingAWB}
                className="h-8"
                data-testid="button-retrieve-awb"
              >
                {isLoadingAWB ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Retrieving...
                  </>
                ) : (
                  'Retrieve AWB'
                )}
              </Button>
            </div>
          )}

          {order.status && (
            <div className="space-y-1 col-span-2">
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant="secondary" data-testid="badge-order-status">
                {order.status}
              </Badge>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">No order information available</p>
          <p className="text-xs text-muted-foreground mt-1">
            Customer email may not contain an order number
          </p>
        </div>
      )}
    </Card>
  );
}

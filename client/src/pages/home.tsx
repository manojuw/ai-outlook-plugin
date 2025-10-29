import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CustomerInfoCard } from "@/components/customer-info-card";
import { EmailThreadTimeline } from "@/components/email-thread-timeline";
import { OrderAWBPanel } from "@/components/order-awb-panel";
import { ShippingStatusTracker } from "@/components/shipping-status-tracker";
import { AIAnalysisSection } from "@/components/ai-analysis-section";
import { ResponseComposer } from "@/components/response-composer";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type {
  CustomerInfo,
  EmailThread,
  Order,
  ShippingStatus,
  AIAnalysis,
  AIResponse,
} from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const [customerEmail] = useState("customer@example.com"); // This would come from Office.js context
  const [currentEmailId] = useState("email-123"); // This would come from Office.js context

  // Main analysis mutation (using POST as backend expects)
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/analyze', { 
        customerEmail, 
        currentEmailId 
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/analyze', customerEmail], data);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not analyze customer history. Please try again.",
      });
    },
  });

  const { data: analysisData, isLoading: isAnalyzing, error: analysisError } = useQuery<{
    customer: CustomerInfo;
    emailHistory: EmailThread[];
    aiAnalysis: AIAnalysis;
    order?: Order;
    shippingStatus?: ShippingStatus;
    awbCommunications?: EmailThread[];
    aiResponse?: AIResponse;
  }>({
    queryKey: ['/api/analyze', customerEmail],
    enabled: false,
    initialData: undefined,
  });

  const analyzeCustomer = () => {
    analyzeMutation.mutate();
  };

  // AWB lookup mutation
  const awbMutation = useMutation({
    mutationFn: async (orderNumber: string) => {
      return apiRequest('POST', '/api/lookup-awb', { orderNumber });
    },
    onSuccess: async (data) => {
      // Update the cached analysis data with the new AWB number using deep clone
      const currentData = queryClient.getQueryData(['/api/analyze', customerEmail]) as any;
      if (currentData && currentData.order) {
        // Deep clone to avoid mutation
        const updatedData = structuredClone(currentData);
        updatedData.order.awbNumber = data.awbNumber;
        queryClient.setQueryData(['/api/analyze', customerEmail], updatedData);
      }
      
      // Trigger re-analysis to get full tracking data
      try {
        await analyzeMutation.mutateAsync();
        toast({
          title: "AWB Retrieved",
          description: "Shipment tracking number has been found",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Re-analysis Failed",
          description: "AWB found but could not refresh full data",
        });
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "AWB Lookup Failed",
        description: error?.message || "Failed to retrieve AWB number",
      });
    },
  });

  // Tracking refresh mutation
  const trackingMutation = useMutation({
    mutationFn: async (awbNumber: string) => {
      return apiRequest('POST', '/api/track-shipment', { awbNumber });
    },
    onSuccess: (data) => {
      // Update the cached analysis data with new shipping status using deep clone
      const currentData = queryClient.getQueryData(['/api/analyze', customerEmail]) as any;
      if (currentData) {
        const updatedData = structuredClone(currentData);
        updatedData.shippingStatus = data;
        queryClient.setQueryData(['/api/analyze', customerEmail], updatedData);
      }
      
      toast({
        title: "Tracking Updated",
        description: "Latest shipment status retrieved",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Tracking Update Failed",
        description: error?.message || "Could not refresh shipment tracking",
      });
    },
  });

  // Response regeneration mutation
  const regenerateMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/regenerate-response', {
        customerEmail,
        emailHistory: analysisData?.emailHistory || [],
        aiAnalysis: analysisData?.aiAnalysis,
        shippingStatus: analysisData?.shippingStatus,
        awbCommunications: analysisData?.awbCommunications,
      });
    },
    onSuccess: (data) => {
      // Update the cached analysis data with new AI response using deep clone
      const currentData = queryClient.getQueryData(['/api/analyze', customerEmail]) as any;
      if (currentData) {
        const updatedData = structuredClone(currentData);
        updatedData.aiResponse = data;
        queryClient.setQueryData(['/api/analyze', customerEmail], updatedData);
      }
      
      toast({
        title: "Response Regenerated",
        description: "A new AI response has been generated",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Regeneration Failed",
        description: error?.message || "Could not generate new response",
      });
    },
  });

  // Send response mutation
  const sendMutation = useMutation({
    mutationFn: async ({ response, answers }: { response: string; answers: Record<string, string> }) => {
      return apiRequest('POST', '/api/send-response', {
        customerEmail,
        response,
        answers,
      });
    },
    onSuccess: () => {
      toast({
        title: "Response Sent",
        description: "Your email has been sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Send Failed",
        description: error?.message || "Failed to send response",
      });
    },
  });

  const handleAnalyze = () => {
    analyzeCustomer();
  };

  const handleRetrieveAWB = () => {
    if (analysisData?.order?.orderNumber) {
      awbMutation.mutate(analysisData.order.orderNumber);
    }
  };

  const handleRefreshTracking = () => {
    if (analysisData?.shippingStatus?.awbNumber) {
      trackingMutation.mutate(analysisData.shippingStatus.awbNumber);
    }
  };

  const handleSendResponse = (response: string, answers: Record<string, string>) => {
    sendMutation.mutate({ response, answers });
  };

  if (analyzeMutation.isPending) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Customer Support AI</h1>
            <p className="text-xs text-muted-foreground">Intelligent email assistance</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 space-y-6 pb-24">
        {!analysisData && !analysisError && (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold mb-2">Ready to Assist</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Analyze this customer's complete email history and generate an intelligent response
              </p>
              <Button
                onClick={handleAnalyze}
                size="lg"
                className="w-full"
                data-testid="button-analyze-history"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Customer History
              </Button>
            </div>
          </div>
        )}

        {analysisError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to analyze customer history. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {analysisData && (
          <>
            <CustomerInfoCard customer={analysisData.customer} />

            {analysisData.aiAnalysis && (
              <AIAnalysisSection analysis={analysisData.aiAnalysis} />
            )}

            {analysisData.order && (
              <OrderAWBPanel
                order={analysisData.order}
                isLoadingAWB={awbMutation.isPending}
                onRetrieveAWB={handleRetrieveAWB}
              />
            )}

            {analysisData.shippingStatus && (
              <ShippingStatusTracker
                status={analysisData.shippingStatus}
                isLoading={trackingMutation.isPending}
                onRefresh={handleRefreshTracking}
              />
            )}

            <EmailThreadTimeline emails={analysisData.emailHistory} />

            {analysisData.awbCommunications && analysisData.awbCommunications.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-semibold">Related AWB Communications</h3>
                <EmailThreadTimeline emails={analysisData.awbCommunications} />
              </div>
            )}

            {analysisData.aiResponse && (
              <ResponseComposer
                response={analysisData.aiResponse}
                isGenerating={regenerateMutation.isPending}
                onRegenerate={() => regenerateMutation.mutate()}
                onSend={handleSendResponse}
              />
            )}
          </>
        )}
      </main>

      {analysisData && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <Button
            onClick={handleAnalyze}
            variant="outline"
            className="w-full"
            disabled={analyzeMutation.isPending}
            data-testid="button-reanalyze"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Re-analyze Customer
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

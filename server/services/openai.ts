// Based on blueprint: javascript_openai_ai_integrations
import OpenAI from "openai";
import pLimit from "p-limit";
import pRetry from "p-retry";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
const getOpenAIClient = () => {
  if (!process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || !process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    throw new Error('OpenAI AI Integrations not configured. Please set up the integration.');
  }
  return new OpenAI({
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
  });
};

// Helper function to check if error is rate limit or quota violation
function isRateLimitError(error: any): boolean {
  const errorMsg = error?.message || String(error);
  return (
    errorMsg.includes("429") ||
    errorMsg.includes("RATELIMIT_EXCEEDED") ||
    errorMsg.toLowerCase().includes("quota") ||
    errorMsg.toLowerCase().includes("rate limit")
  );
}

interface EmailThread {
  sender: string;
  senderEmail: string;
  subject: string;
  snippet: string;
  body: string;
  timestamp: string;
  isFromOrganization: boolean;
}

interface AnalysisResult {
  communicationSummary: string[];
  extractedOrderNumber?: string;
  recommendedActions: Array<{
    action: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  sentiment?: 'frustrated' | 'neutral' | 'satisfied';
}

interface ShippingStatus {
  currentStatus: string;
  issue?: string;
  issueType?: 'pincode_mismatch' | 'wrong_warehouse' | 'delayed' | 'none';
}

export async function analyzeEmailHistory(
  customerEmail: string,
  emailHistory: EmailThread[]
): Promise<AnalysisResult> {
  const prompt = `You are an expert customer support analyst. Analyze the following email thread history with a customer and provide insights.

Customer Email: ${customerEmail}

Email History (chronological order):
${emailHistory.map((email, i) => `
${i + 1}. From: ${email.sender} (${email.senderEmail})
   Subject: ${email.subject}
   Date: ${email.timestamp}
   Content: ${email.body}
   ${email.isFromOrganization ? '[SENT BY OUR ORGANIZATION]' : '[FROM CUSTOMER]'}
`).join('\n')}

Please analyze this conversation and provide:
1. A chronological summary of key communication points (3-5 bullet points)
2. Extract any order number mentioned (format: ORDER-XXXXX or similar patterns)
3. Recommend 1-3 specific actions the support agent should take
4. Assess the customer's sentiment (frustrated, neutral, or satisfied)

Return your analysis as JSON in this exact format:
{
  "communicationSummary": ["summary point 1", "summary point 2", ...],
  "extractedOrderNumber": "ORDER-123" or null,
  "recommendedActions": [
    {"action": "action description", "reason": "why this is needed", "priority": "high|medium|low"}
  ],
  "sentiment": "frustrated|neutral|satisfied"
}`;

  return await pRetry(
    async () => {
      try {
        const openai = getOpenAIClient();
        const response = await openai.chat.completions.create({
          model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
          messages: [{ role: "user", content: prompt }],
          max_completion_tokens: 8192,
          response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content || "{}";
        return JSON.parse(content) as AnalysisResult;
      } catch (error: any) {
        if (isRateLimitError(error)) {
          throw error;
        }
        throw new pRetry.AbortError(error);
      }
    },
    {
      retries: 7,
      minTimeout: 2000,
      maxTimeout: 128000,
      factor: 2,
    }
  );
}

export async function generateResponse(
  customerEmail: string,
  emailHistory: EmailThread[],
  analysis: AnalysisResult,
  shippingStatus?: ShippingStatus,
  awbCommunications?: EmailThread[]
): Promise<{
  draftResponse: string;
  dynamicQuestions?: Array<{
    id: string;
    question: string;
    type: 'radio' | 'checkbox' | 'text';
    options?: string[];
  }>;
  context: string;
}> {
  const latestCustomerEmail = emailHistory.filter(e => !e.isFromOrganization).pop();
  
  let contextParts: string[] = [];
  contextParts.push(`Latest customer email: "${latestCustomerEmail?.subject}"`);
  
  if (analysis.extractedOrderNumber) {
    contextParts.push(`Order Number: ${analysis.extractedOrderNumber}`);
  }
  
  if (shippingStatus) {
    contextParts.push(`Shipment Status: ${shippingStatus.currentStatus}`);
    if (shippingStatus.issue) {
      contextParts.push(`Issue: ${shippingStatus.issue}`);
    }
  }

  if (awbCommunications && awbCommunications.length > 0) {
    contextParts.push(`Found ${awbCommunications.length} related communications about this shipment`);
  }

  const context = contextParts.join(', ');

  const prompt = `You are a professional customer support agent. Generate a helpful, empathetic email response based on the following context:

Customer Email: ${customerEmail}
Customer Sentiment: ${analysis.sentiment || 'neutral'}

Latest Customer Message:
Subject: ${latestCustomerEmail?.subject || 'N/A'}
Content: ${latestCustomerEmail?.body || 'N/A'}

Communication History Summary:
${analysis.communicationSummary.join('\n')}

${shippingStatus ? `Current Shipment Status:
Status: ${shippingStatus.currentStatus}
${shippingStatus.issue ? `Issue: ${shippingStatus.issue}` : ''}
${shippingStatus.issueType === 'pincode_mismatch' ? 'IMPORTANT: There is a pincode mismatch issue.' : ''}
${shippingStatus.issueType === 'wrong_warehouse' ? 'IMPORTANT: Package is at wrong warehouse.' : ''}
` : ''}

${awbCommunications && awbCommunications.length > 0 ? `Previous Communications About This Shipment:
${awbCommunications.map(c => `- ${c.subject}: ${c.snippet}`).join('\n')}
` : ''}

Recommended Actions:
${analysis.recommendedActions.map(a => `- ${a.action} (Priority: ${a.priority})`).join('\n')}

Generate:
1. A professional, empathetic email response addressing the customer's concerns
2. If there's a pincode mismatch issue, include dynamic questions asking if they want to update address or cancel/refund
3. If the shipment is delayed, provide estimated timeline if available
4. Keep the tone professional but warm

Return as JSON:
{
  "draftResponse": "email content here",
  "dynamicQuestions": [
    {
      "id": "question_1",
      "question": "question text",
      "type": "radio",
      "options": ["option1", "option2"]
    }
  ] or null if no questions needed
}`;

  return await pRetry(
    async () => {
      try {
        const openai = getOpenAIClient();
        const response = await openai.chat.completions.create({
          model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
          messages: [{ role: "user", content: prompt }],
          max_completion_tokens: 8192,
          response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content || "{}";
        const result = JSON.parse(content);
        return {
          draftResponse: result.draftResponse || "",
          dynamicQuestions: result.dynamicQuestions || undefined,
          context,
        };
      } catch (error: any) {
        if (isRateLimitError(error)) {
          throw error;
        }
        throw new pRetry.AbortError(error);
      }
    },
    {
      retries: 7,
      minTimeout: 2000,
      maxTimeout: 128000,
      factor: 2,
    }
  );
}

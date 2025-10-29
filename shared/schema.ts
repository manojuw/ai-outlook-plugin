import { z } from "zod";

// Email Thread Schema
export const emailThreadSchema = z.object({
  id: z.string(),
  sender: z.string(),
  senderEmail: z.string(),
  subject: z.string(),
  snippet: z.string(),
  body: z.string(),
  timestamp: z.string(),
  isFromOrganization: z.boolean(),
  threadId: z.string().optional(),
});

export type EmailThread = z.infer<typeof emailThreadSchema>;

// Customer Info Schema
export const customerInfoSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  totalEmails: z.number(),
});

export type CustomerInfo = z.infer<typeof customerInfoSchema>;

// Order Schema
export const orderSchema = z.object({
  orderNumber: z.string(),
  awbNumber: z.string().optional(),
  status: z.string().optional(),
});

export type Order = z.infer<typeof orderSchema>;

// Shipping Status Schema
export const shippingStatusSchema = z.object({
  awbNumber: z.string(),
  currentStatus: z.string(),
  location: z.string().optional(),
  timestamp: z.string(),
  issue: z.string().optional(),
  issueType: z.enum(['pincode_mismatch', 'wrong_warehouse', 'delayed', 'none']).optional(),
  timeline: z.array(z.object({
    status: z.string(),
    location: z.string(),
    timestamp: z.string(),
  })),
});

export type ShippingStatus = z.infer<typeof shippingStatusSchema>;

// AI Analysis Schema
export const aiAnalysisSchema = z.object({
  communicationSummary: z.array(z.string()),
  extractedOrderNumber: z.string().optional(),
  recommendedActions: z.array(z.object({
    action: z.string(),
    reason: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
  })),
  sentiment: z.enum(['frustrated', 'neutral', 'satisfied']).optional(),
});

export type AIAnalysis = z.infer<typeof aiAnalysisSchema>;

// AI Response Schema
export const aiResponseSchema = z.object({
  draftResponse: z.string(),
  dynamicQuestions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    type: z.enum(['radio', 'checkbox', 'text']),
    options: z.array(z.string()).optional(),
  })).optional(),
  context: z.string().optional(),
});

export type AIResponse = z.infer<typeof aiResponseSchema>;

// Request/Response Types for API endpoints
export const analyzeCustomerRequestSchema = z.object({
  customerEmail: z.string().email(),
  currentEmailId: z.string(),
});

export type AnalyzeCustomerRequest = z.infer<typeof analyzeCustomerRequestSchema>;

export const generateResponseRequestSchema = z.object({
  customerEmail: z.string().email(),
  emailHistory: z.array(emailThreadSchema),
  aiAnalysis: aiAnalysisSchema,
  shippingStatus: shippingStatusSchema.optional(),
  awbCommunications: z.array(emailThreadSchema).optional(),
});

export type GenerateResponseRequest = z.infer<typeof generateResponseRequestSchema>;

// AWB Lookup Request
export const awbLookupRequestSchema = z.object({
  orderNumber: z.string(),
});

export type AWBLookupRequest = z.infer<typeof awbLookupRequestSchema>;

// Tracking Request
export const trackingRequestSchema = z.object({
  awbNumber: z.string(),
});

export type TrackingRequest = z.infer<typeof trackingRequestSchema>;

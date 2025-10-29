import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { analyzeEmailHistory, generateResponse } from "./services/openai";
import { getEmailsByCustomer, searchEmailsByAWB, sendEmail } from "./services/gmail";
import { lookupAWBFromOrder, trackShipment, getOrderDetails } from "./services/external-apis";
import {
  analyzeCustomerRequestSchema,
  generateResponseRequestSchema,
  awbLookupRequestSchema,
  trackingRequestSchema,
  type EmailThread,
  type CustomerInfo,
  type AIAnalysis,
  type Order,
  type ShippingStatus,
  type AIResponse,
} from "@shared/schema";

const ORGANIZATION_DOMAIN = process.env.ORGANIZATION_DOMAIN || 'example.com';

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Main analysis endpoint - analyzes customer email history and generates response
  app.post("/api/analyze", async (req, res) => {
    try {
      const { customerEmail } = analyzeCustomerRequestSchema.parse(req.body);
      
      // Step 1: Fetch all emails with this customer
      const emailHistory = await getEmailsByCustomer(customerEmail, ORGANIZATION_DOMAIN);
      
      if (emailHistory.length === 0) {
        return res.json({
          customer: {
            email: customerEmail,
            totalEmails: 0,
          },
          emailHistory: [],
          aiAnalysis: {
            communicationSummary: ['No email history found with this customer'],
            recommendedActions: [],
          },
        });
      }

      // Step 2: Analyze the email history with AI
      const aiAnalysis = await analyzeEmailHistory(customerEmail, emailHistory);
      
      // Step 3: If order number extracted, look up AWB
      let order: Order | undefined;
      let shippingStatus: ShippingStatus | undefined;
      let awbCommunications: EmailThread[] | undefined;
      
      if (aiAnalysis.extractedOrderNumber) {
        order = await getOrderDetails(aiAnalysis.extractedOrderNumber);
        const awbNumber = await lookupAWBFromOrder(aiAnalysis.extractedOrderNumber);
        
        if (awbNumber) {
          order.awbNumber = awbNumber;
          
          // Step 4: Get shipping status
          shippingStatus = await trackShipment(awbNumber);
          
          // Step 5: Search for other communications about this AWB
          awbCommunications = await searchEmailsByAWB(awbNumber, ORGANIZATION_DOMAIN);
        }
      }
      
      // Step 6: Generate AI response
      const aiResponse = await generateResponse(
        customerEmail,
        emailHistory,
        aiAnalysis,
        shippingStatus,
        awbCommunications
      );
      
      // Build customer info
      const customer: CustomerInfo = {
        email: customerEmail,
        name: emailHistory.find(e => !e.isFromOrganization)?.sender,
        totalEmails: emailHistory.length,
      };
      
      res.json({
        customer,
        emailHistory,
        aiAnalysis,
        order,
        shippingStatus,
        awbCommunications,
        aiResponse,
      });
      
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze customer history' });
    }
  });

  // AWB lookup endpoint
  app.post("/api/lookup-awb", async (req, res) => {
    try {
      const { orderNumber } = awbLookupRequestSchema.parse(req.body);
      
      const awbNumber = await lookupAWBFromOrder(orderNumber);
      
      if (!awbNumber) {
        return res.status(404).json({ error: 'AWB not found for this order' });
      }
      
      res.json({ awbNumber });
      
    } catch (error) {
      console.error('AWB lookup error:', error);
      res.status(500).json({ error: 'Failed to lookup AWB number' });
    }
  });

  // Shipment tracking endpoint
  app.post("/api/track-shipment", async (req, res) => {
    try {
      const { awbNumber } = trackingRequestSchema.parse(req.body);
      
      const status = await trackShipment(awbNumber);
      
      res.json(status);
      
    } catch (error) {
      console.error('Tracking error:', error);
      res.status(500).json({ error: 'Failed to track shipment' });
    }
  });

  // Regenerate response endpoint
  app.post("/api/regenerate-response", async (req, res) => {
    try {
      const data = generateResponseRequestSchema.parse(req.body);
      
      const aiResponse = await generateResponse(
        data.customerEmail,
        data.emailHistory,
        data.aiAnalysis,
        data.shippingStatus,
        data.awbCommunications
      );
      
      res.json(aiResponse);
      
    } catch (error) {
      console.error('Response generation error:', error);
      res.status(500).json({ error: 'Failed to generate response' });
    }
  });

  // Send response endpoint
  app.post("/api/send-response", async (req, res) => {
    try {
      const schema = z.object({
        customerEmail: z.string().email(),
        response: z.string(),
        answers: z.record(z.string()),
      });
      
      const { customerEmail, response, answers } = schema.parse(req.body);
      
      // Include answers in the email if there are any
      let finalResponse = response;
      if (Object.keys(answers).length > 0) {
        finalResponse += '\n\n---\nYour Responses:\n';
        Object.entries(answers).forEach(([question, answer]) => {
          finalResponse += `${question}: ${answer}\n`;
        });
      }
      
      await sendEmail(
        customerEmail,
        'Re: Your inquiry',
        finalResponse
      );
      
      res.json({ success: true });
      
    } catch (error) {
      console.error('Send email error:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

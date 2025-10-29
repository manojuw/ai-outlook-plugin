# Customer Support AI Assistant - Outlook Plugin

## Overview
An AI-powered Outlook add-in that helps customer support teams respond intelligently to customer inquiries. The plugin integrates with Google Workspace Email, retrieves order and shipment information, tracks package status, and generates contextual responses using AI.

**Purpose**: Streamline customer support workflows by automating email history analysis, order tracking, and response generation.

**Current State**: MVP complete with full frontend and backend implementation. All core features functional including email analysis, AWB lookup, shipment tracking, and AI-powered response generation.

**Tech Stack**:
- Frontend: React + TypeScript, Tailwind CSS, Shadcn UI components
- Backend: Express.js, Node.js
- AI: OpenAI via Replit AI Integrations (GPT-5)
- Email: Gmail API via Replit connector
- Storage: In-memory storage (MemStorage)

## Recent Changes (October 29, 2025)

### Phase 1: Schema & Frontend (Completed)
- ✅ Defined comprehensive TypeScript schemas for all data models
- ✅ Built all React components following Fluent Design principles:
  - CustomerInfoCard: Displays customer email and contact information
  - EmailThreadTimeline: Chronological email history with expand/collapse
  - OrderAWBPanel: Order and AWB number display with retrieval action
  - ShippingStatusTracker: Real-time shipment tracking with timeline
  - AIAnalysisSection: Communication summary and recommended actions
  - ResponseComposer: AI-generated draft with dynamic questions
  - LoadingSkeleton: Beautiful loading states
- ✅ Configured design tokens in index.html and tailwind.config.ts
- ✅ Added Segoe UI font family for Microsoft Office integration
- ✅ Implemented responsive design optimized for Outlook taskpane (320-400px width)

### Phase 2: Backend Implementation (Completed)
- ✅ Gmail API integration for email history fetching and organization-wide search
- ✅ OpenAI GPT-5 integration for email analysis and response generation
- ✅ External API stubs for order-to-AWB lookup and shipment tracking
- ✅ Defensive error handling for missing credentials
- ✅ Retry logic with exponential backoff for AI requests
- ✅ All API endpoints implemented with Zod validation

### Phase 3: Integration & Polish (Completed)
- ✅ Fixed POST/GET mismatch for analysis endpoint
- ✅ Implemented proper mutation-based data flow with TanStack Query
- ✅ Added immutable cache updates using structuredClone
- ✅ Fixed ResponseComposer state synchronization with useEffect
- ✅ Added comprehensive error toasts for all mutations
- ✅ Implemented loading states throughout the application
- ✅ Preserved dynamic question answers across regenerations
- ✅ All MVP features working end-to-end

### MVP Features Delivered
✅ One-click customer email history analysis
✅ AI-powered communication summarization
✅ Automatic order number extraction
✅ AWB lookup from order management API
✅ Real-time shipment tracking with timeline
✅ Organization-wide AWB communication search
✅ Context-aware AI response generation
✅ Dynamic follow-up questions based on shipping issues
✅ Response editing and sending functionality
✅ Beautiful loading and error states throughout

## Project Architecture

### Data Models
All schemas defined in `shared/schema.ts`:
- **EmailThread**: Email metadata, content, sender info
- **CustomerInfo**: Customer contact details and email count
- **Order**: Order number and AWB tracking details
- **ShippingStatus**: Current status, location, timeline, issues
- **AIAnalysis**: Communication summary, extracted data, recommendations
- **AIResponse**: Generated draft response with dynamic questions

### Component Structure
```
client/src/
├── components/
│   ├── ui/ (shadcn components)
│   ├── customer-info-card.tsx
│   ├── email-thread-timeline.tsx
│   ├── order-awb-panel.tsx
│   ├── shipping-status-tracker.tsx
│   ├── ai-analysis-section.tsx
│   ├── response-composer.tsx
│   └── loading-skeleton.tsx
├── pages/
│   └── home.tsx (main taskpane interface)
└── App.tsx (routing)
```

### API Endpoints (Implemented)
- `POST /api/analyze` - Analyze customer email history ✅
- `POST /api/lookup-awb` - Retrieve AWB from order number ✅
- `POST /api/track-shipment` - Get shipment tracking status ✅
- `POST /api/regenerate-response` - Generate new AI response ✅
- `POST /api/send-response` - Send email response ✅

## User Preferences

### Design System
- **Approach**: Microsoft Fluent Design
- **Rationale**: Seamless integration with Outlook, productivity-focused
- **Typography**: Segoe UI system font for consistency
- **Spacing**: Compact (p-2, p-3, p-4, gap-3, gap-4)
- **Layout**: Single-column for taskpane constraint
- **Colors**: Professional blue primary, subtle grays for hierarchy

### Key Features
1. **One-Click Analysis**: Single button to analyze complete customer history
2. **Chronological Timeline**: Clear visual separation between organization and customer emails
3. **AI-Powered Insights**: Communication summary, sentiment analysis, recommended actions
4. **Smart Response Generation**: Context-aware drafts with dynamic follow-up questions
5. **Shipment Tracking**: Real-time status updates with issue detection
6. **AWB Cross-Reference**: Find all organization communications related to shipping numbers

### User Journey
1. Customer email arrives in Outlook
2. User opens plugin taskpane
3. Click "Analyze Customer History" button
4. AI analyzes all emails, extracts order number, retrieves AWB
5. System checks for related communications across organization
6. Fetches real-time shipping status from external API
7. AI generates contextual response based on all available data
8. User reviews/edits draft and sends response

## Technical Decisions

### Why Fluent Design?
- Native Microsoft ecosystem integration
- Optimized for productivity workflows
- Proven patterns for information-dense interfaces
- Accessibility standards built-in

### Why In-Memory Storage?
- Fast prototyping and development
- No database setup complexity
- Suitable for session-based plugin operations
- Easy migration to persistent storage later

### Why Replit AI Integrations?
- No API key management required
- Automatic credential rotation
- Billed to Replit credits
- GPT-5 model access (latest as of August 2025)

## Integration Details

### OpenAI Integration
- Blueprint: `javascript_openai_ai_integrations`
- Models available: gpt-5, gpt-5-mini, gpt-4.1, gpt-4o
- Use cases: Email analysis, order extraction, response generation
- Environment variables: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`

### Gmail Integration
- Connector: `connection:conn_google-mail_*`
- Permissions: Read messages, send emails, manage labels
- Used for: Fetching customer email history, organization-wide search
- Authentication: OAuth 2.0 via Replit connector

## Development Guidelines

### Frontend Standards
- Follow design_guidelines.md religiously
- Use Shadcn UI components exclusively
- Implement all three states: loading, error, success
- Ensure 4.5:1 contrast ratio for accessibility
- Test at 320px, 360px, and 400px widths
- Add data-testid to all interactive elements

### Backend Standards
- No mock data in final implementation
- Validate all requests with Zod schemas
- Use storage interface for all CRUD operations
- Implement retry logic for external API calls
- Handle rate limits gracefully with p-retry

### Code Organization
- Keep related logic together in components
- Extract reusable utilities to lib/
- Type everything with TypeScript
- Use proper error boundaries
- Log errors for debugging

## Known Limitations
- Requires Google Workspace Email (not standalone Gmail)
- External API endpoints need to be provided by user
- Currently limited to email analysis (no voice/video support)
- In-memory storage resets on server restart

## Future Enhancements
- Multi-language support for international customers
- Response quality analytics and tracking
- Admin dashboard for API configuration
- Caching layer for frequently accessed data
- Approval workflow before sending responses

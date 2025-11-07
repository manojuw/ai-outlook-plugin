# Customer Support AI Assistant - Outlook Plugin

An AI-powered Outlook add-in that helps customer support teams respond intelligently to customer inquiries. The plugin integrates with Google Workspace Email, retrieves order and shipment information, tracks package status, and generates contextual responses using AI.

## Features

- 🔍 **One-Click Email Analysis** - Analyze complete customer email history with a single button
- 🤖 **AI-Powered Insights** - Automatic communication summarization and sentiment analysis
- 📦 **Order & Shipment Tracking** - Retrieve AWB numbers and real-time tracking status
- ✉️ **Smart Response Generation** - Context-aware email drafts with dynamic follow-up questions
- 🔄 **Organization-Wide Search** - Find all communications related to a shipment
- 🎨 **Fluent Design UI** - Seamless integration with Microsoft Outlook

## Prerequisites

- Node.js 18 or higher
- A Replit account (for deployment)
- Google Workspace Email account
- OpenAI API access (via AI Integrations)
- Microsoft Outlook (Desktop, Web, or Mobile)

## Project Setup

### 1. Clone or Fork the Project

If you're working in Replit, the project is already set up. If running locally:

```bash
git clone <repository-url>
cd customer-support-ai-assistant
```

### 2. Install Dependencies

Dependencies are automatically managed in Replit. For local development:

```bash
npm install
```

### 3. Configure Integrations

This application requires two integrations to be set up:

#### a) Google Workspace Email Integration

1. Navigate to the **Tools** panel in Replit
2. Search for "Gmail" or "Google Mail"
3. Click **Connect** and authorize access to your Google Workspace account
4. Grant permissions for reading and sending emails

#### b) OpenAI AI Integrations

1. In the Replit Tools panel, search for "OpenAI"
2. Select the **AI Integrations** option
3. Click **Set up** to enable OpenAI access
4. This provides GPT-5 access without requiring your own API key

### 4. Set Environment Variables

The application uses the following environment variables (automatically configured by integrations):

- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI API endpoint (auto-configured)
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key (auto-configured)
- `CONNECTORS_HOSTNAME` - Connector service hostname (auto-configured)
- `SESSION_SECRET` - Session encryption key (already set)

**Note:** You do not need to manually configure these variables if using Replit integrations.

## Running the Application

### Development Mode (Replit)

1. Click the **Run** button at the top of the Replit workspace
2. The application will start on port 5000
3. Replit will provide a preview URL like `https://<your-repl-name>.<username>.repl.co`

### Development Mode (Local)

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Building for Production

```bash
npm run build
```

## Deploying the Application

### Deploy on Replit

1. Click the **Publish** button in the top-right corner of your Replit workspace
2. Replit will automatically select **Autoscale Deployment** (recommended for this app)
3. Review the deployment settings:
   - **Domain**: Your app will get a public URL like `https://<app-name>.replit.app`
   - **Environment Secrets**: Automatically synced from workspace
4. Click **Publish** to deploy
5. Copy your published app URL - you'll need it for the Outlook plugin configuration

**Important:** The published URL must be publicly accessible for Outlook to load the plugin.

### Custom Domain (Optional)

After publishing, you can configure a custom domain:
1. Go to your published app settings
2. Click **Add custom domain**
3. Follow the DNS configuration instructions

## Installing the Plugin in Outlook

Since this is a custom add-in, you'll need to "sideload" it into Outlook. The process varies by platform:

### Outlook Web (Office 365)

1. **Create a Manifest File**
   
   Create a file named `manifest.xml` with the following content (replace `YOUR_DEPLOYED_URL` with your published Replit app URL):

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <OfficeApp xmlns="http://schemas.microsoft.com/office/appforoffice/1.1"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xmlns:bt="http://schemas.microsoft.com/office/officeappbasictypes/1.0"
              xsi:type="TaskPaneApp">
     <Id>12345678-1234-1234-1234-123456789012</Id>
     <Version>1.0.0.0</Version>
     <ProviderName>Your Company</ProviderName>
     <DefaultLocale>en-US</DefaultLocale>
     <DisplayName DefaultValue="Customer Support AI"/>
     <Description DefaultValue="AI-powered customer support assistant"/>
     <IconUrl DefaultValue="https://YOUR_DEPLOYED_URL/icon-32.png"/>
     <HighResolutionIconUrl DefaultValue="https://YOUR_DEPLOYED_URL/icon-64.png"/>
     <SupportUrl DefaultValue="https://YOUR_DEPLOYED_URL/"/>
     <Hosts>
       <Host Name="Mailbox"/>
     </Hosts>
     <Requirements>
       <Sets>
         <Set Name="Mailbox" MinVersion="1.1"/>
       </Sets>
     </Requirements>
     <FormSettings>
       <Form xsi:type="ItemRead">
         <DesktopSettings>
           <SourceLocation DefaultValue="https://YOUR_DEPLOYED_URL/"/>
           <RequestedHeight>450</RequestedHeight>
         </DesktopSettings>
       </Form>
     </FormSettings>
     <Permissions>ReadWriteMailbox</Permissions>
     <Rule xsi:type="RuleCollection" Mode="Or">
       <Rule xsi:type="ItemIs" ItemType="Message" FormType="Read"/>
     </Rule>
     <VersionOverrides xmlns="http://schemas.microsoft.com/office/mailappversionoverrides" xsi:type="VersionOverridesV1_0">
       <Requirements>
         <bt:Sets DefaultMinVersion="1.3">
           <bt:Set Name="Mailbox"/>
         </bt:Sets>
       </Requirements>
       <Hosts>
         <Host xsi:type="MailHost">
           <DesktopFormFactor>
             <FunctionFile resid="Commands.Url"/>
             <ExtensionPoint xsi:type="MessageReadCommandSurface">
               <OfficeTab id="TabDefault">
                 <Group id="msgReadGroup">
                   <Label resid="GroupLabel"/>
                   <Control xsi:type="Button" id="msgReadOpenPaneButton">
                     <Label resid="TaskpaneButton.Label"/>
                     <Supertip>
                       <Title resid="TaskpaneButton.Label"/>
                       <Description resid="TaskpaneButton.Tooltip"/>
                     </Supertip>
                     <Icon>
                       <bt:Image size="16" resid="Icon.16x16"/>
                       <bt:Image size="32" resid="Icon.32x32"/>
                       <bt:Image size="80" resid="Icon.80x80"/>
                     </Icon>
                     <Action xsi:type="ShowTaskpane">
                       <SourceLocation resid="Taskpane.Url"/>
                     </Action>
                   </Control>
                 </Group>
               </OfficeTab>
             </ExtensionPoint>
           </DesktopFormFactor>
         </Host>
       </Hosts>
       <Resources>
         <bt:Images>
           <bt:Image id="Icon.16x16" DefaultValue="https://YOUR_DEPLOYED_URL/icon-16.png"/>
           <bt:Image id="Icon.32x32" DefaultValue="https://YOUR_DEPLOYED_URL/icon-32.png"/>
           <bt:Image id="Icon.80x80" DefaultValue="https://YOUR_DEPLOYED_URL/icon-80.png"/>
         </bt:Images>
         <bt:Urls>
           <bt:Url id="Commands.Url" DefaultValue="https://YOUR_DEPLOYED_URL/"/>
           <bt:Url id="Taskpane.Url" DefaultValue="https://YOUR_DEPLOYED_URL/"/>
         </bt:Urls>
         <bt:ShortStrings>
           <bt:String id="GroupLabel" DefaultValue="Customer Support AI"/>
           <bt:String id="TaskpaneButton.Label" DefaultValue="Open Assistant"/>
         </bt:ShortStrings>
         <bt:LongStrings>
           <bt:String id="TaskpaneButton.Tooltip" DefaultValue="AI-powered customer support assistant"/>
         </bt:LongStrings>
       </Resources>
     </VersionOverrides>
   </OfficeApp>
   ```

2. **Upload to Outlook Web**
   - Go to [Outlook Web](https://outlook.office.com)
   - Click the gear icon (Settings) in the top-right
   - Search for "Add-ins" or "Get Add-ins"
   - Click "My add-ins" in the left panel
   - Under "Custom add-ins", click "Add a custom add-in" → "Add from file"
   - Upload your `manifest.xml` file
   - Click "Install" to confirm

### Outlook Desktop (Windows/Mac)

1. **Enable Developer Mode**
   - Open Outlook Desktop
   - Go to File → Options → Trust Center → Trust Center Settings
   - Click "Trusted Add-in Catalogs"
   - Add a network share or use the centralized deployment option

2. **Sideload via Manifest**
   - Save the `manifest.xml` file to a network location
   - In Outlook, go to Insert → Get Add-ins → My Add-ins
   - Click "Add a custom add-in" → "Add from file"
   - Select your manifest file

### Testing the Installation

1. Open any email in Outlook
2. Look for the "Customer Support AI" button in the ribbon (Desktop) or add-in panel (Web)
3. Click the button to open the taskpane
4. The plugin should load and display the main interface

## Using the Plugin

### Basic Workflow

1. **Open the Plugin** - Click the "Customer Support AI" button when viewing a customer email
2. **Analyze Email History** - Click "Analyze Customer History" to start the AI analysis
3. **Review Insights** - The plugin will display:
   - Customer information
   - Complete email thread timeline
   - AI-generated communication summary
   - Order number and AWB tracking details
   - Real-time shipment status
4. **Generate Response** - Review the AI-generated draft response
5. **Edit & Send** - Make any necessary edits and click "Send Response"

### Advanced Features

- **Refresh Tracking** - Click the refresh icon to get the latest shipment status
- **Regenerate Response** - Click "Regenerate" to create a new AI draft
- **Dynamic Questions** - Answer follow-up questions based on shipping issues
- **AWB Communications** - View all organization emails related to the shipment

## Configuration

### External API Integration

The application uses stub implementations for order lookup and shipment tracking. To integrate with your actual systems:

1. Open `server/services/external-apis.ts`
2. Replace the stub functions with your API endpoints:
   - `lookupAWBFromOrder()` - Connect to your order management system
   - `getShipmentTracking()` - Connect to your shipping provider API

### Organization Domain

Update the organization domain in `server/routes.ts`:

```typescript
const organizationDomain = 'your-company.com'; // Change this
```

## Troubleshooting

### Plugin Not Loading

- **Check URL**: Ensure your deployed app URL is correct in the manifest
- **HTTPS Required**: Outlook requires HTTPS - use the published Replit URL
- **CORS Issues**: The app is configured for cross-origin requests
- **Browser Console**: Check for JavaScript errors in the browser console

### Gmail Integration Not Working

- **Verify Connection**: Go to Replit Tools → Check Gmail connector status
- **Re-authenticate**: Disconnect and reconnect the Gmail integration
- **Permissions**: Ensure you granted all required permissions
- **Workspace Account**: Only Google Workspace accounts are supported (not personal Gmail)

### OpenAI Errors

- **Integration Status**: Verify OpenAI AI Integration is enabled
- **Rate Limits**: The app includes retry logic for rate limiting
- **Model Access**: Ensure you have access to GPT-5 (or change to gpt-4.1 in code)

### Response Not Sending

- **Gmail Permissions**: Check that send email permission was granted
- **Error Messages**: Look for toast notifications with error details
- **Network**: Ensure stable internet connection

## Architecture

### Tech Stack

- **Frontend**: React + TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **AI**: OpenAI GPT-5 via AI Integrations
- **Email**: Gmail API via connector
- **Storage**: In-memory (session-based)

### Project Structure

```
.
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utilities
├── server/                # Backend Express application
│   ├── services/          # External integrations
│   │   ├── gmail.ts      # Gmail API service
│   │   ├── openai.ts     # AI service
│   │   └── external-apis.ts  # Order/tracking APIs
│   ├── routes.ts          # API endpoints
│   └── index.ts           # Server entry point
├── shared/                # Shared TypeScript types
│   └── schema.ts          # Data models
└── manifest.xml           # Outlook add-in manifest (create this)
```

### API Endpoints

- `POST /api/analyze` - Analyze customer email history
- `POST /api/lookup-awb` - Retrieve AWB from order number
- `POST /api/track-shipment` - Get shipment tracking status
- `POST /api/regenerate-response` - Generate new AI response
- `POST /api/send-response` - Send email response

## Security Considerations

- All API keys and secrets are stored as encrypted environment variables
- Gmail access uses OAuth 2.0 with scoped permissions
- Session data is encrypted with SESSION_SECRET
- HTTPS required for production deployment
- No sensitive data is logged or exposed to client

## Support & Contributing

For issues, questions, or contributions:
- Check the application logs in Replit Console
- Review browser console for client-side errors
- Ensure all integrations are properly configured
- Test with a simple customer email first

## License

[Add your license information here]

## Acknowledgments

- Built with Replit platform integrations
- UI components from Shadcn
- Icons from Lucide React
- AI powered by OpenAI GPT-5

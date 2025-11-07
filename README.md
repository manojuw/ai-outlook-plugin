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
- npm or yarn package manager
- OpenAI API account and API key
- Google Cloud Console project with Gmail API enabled
- Microsoft Outlook (Desktop, Web, or Mobile)
- Docker and Docker Compose (for containerized deployment)

## Table of Contents

- [Local Development Setup](#local-development-setup)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Installing the Outlook Plugin](#installing-the-outlook-plugin)
- [Configuration](#configuration)
- [API Integration](#api-integration)
- [Troubleshooting](#troubleshooting)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd customer-support-ai-assistant
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and configure the following variables:

```env
# Generate a secure session secret
SESSION_SECRET=your-secret-key-here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1

# Gmail OAuth Configuration
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REDIRECT_URI=http://localhost:5000/auth/google/callback
GMAIL_REFRESH_TOKEN=your-refresh-token

# Organization Configuration
ORGANIZATION_DOMAIN=your-company.com
ORGANIZATION_EMAIL=support@your-company.com
```

### 4. Obtain OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the key and add it to your `.env` file as `OPENAI_API_KEY`

### 5. Set Up Gmail OAuth

#### a) Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to "APIs & Services" > "Library"
4. Search for "Gmail API" and enable it

#### b) Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "Internal" (for Google Workspace) or "External"
3. Fill in application name, user support email, and developer contact
4. Add scopes: `https://www.googleapis.com/auth/gmail.readonly` and `https://www.googleapis.com/auth/gmail.send`
5. Save and continue

#### c) Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Add authorized redirect URI: `http://localhost:5000/auth/google/callback`
5. Copy the Client ID and Client Secret to your `.env` file

#### d) Generate Refresh Token

You'll need to create a small script or use OAuth playground to get a refresh token:

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click settings (gear icon), check "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. In Step 1, select Gmail API v1 scopes (read and send)
5. Click "Authorize APIs" and log in
6. In Step 2, click "Exchange authorization code for tokens"
7. Copy the "Refresh token" to your `.env` file

### 6. Generate Session Secret

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add the generated secret to your `.env` file as `SESSION_SECRET`.

### 7. Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5000`

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Prepare Environment Variables**

   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

2. **Build and Start Container**

   ```bash
   docker-compose up -d
   ```

3. **View Logs**

   ```bash
   docker-compose logs -f
   ```

4. **Stop Container**

   ```bash
   docker-compose down
   ```

### Using Docker Only

1. **Build Image**

   ```bash
   docker build -t customer-support-ai:latest .
   ```

2. **Run Container**

   ```bash
   docker run -d \
     --name customer-support-ai \
     -p 5000:5000 \
     -e SESSION_SECRET=your-secret \
     -e OPENAI_API_KEY=your-key \
     -e GMAIL_CLIENT_ID=your-client-id \
     -e GMAIL_CLIENT_SECRET=your-secret \
     -e GMAIL_REFRESH_TOKEN=your-token \
     customer-support-ai:latest
   ```

3. **View Logs**

   ```bash
   docker logs -f customer-support-ai
   ```

## Production Deployment

### Deployment Options

You can deploy this application to any cloud platform that supports Node.js or Docker:

- **Cloud Providers**: AWS (ECS, EC2), Google Cloud (Cloud Run, GKE), Azure (Container Instances, AKS)
- **Platform as a Service**: Heroku, DigitalOcean App Platform, Railway
- **VPS**: DigitalOcean Droplets, Linode, Vultr
- **On-Premises**: Your own infrastructure with Docker or Node.js

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `SESSION_SECRET` (32+ random characters)
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure proper CORS settings
- [ ] Set up monitoring and logging
- [ ] Configure backup and disaster recovery
- [ ] Implement rate limiting
- [ ] Set up firewall rules
- [ ] Use environment-specific Gmail OAuth redirect URIs
- [ ] Rotate API keys regularly

### Reverse Proxy with Nginx (Optional)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

For HTTPS, use Let's Encrypt:

```bash
sudo certbot --nginx -d your-domain.com
```

## Installing the Outlook Plugin

### Step 1: Create Manifest File

Create a file named `manifest.xml` in your project root:

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
  <IconUrl DefaultValue="https://your-domain.com/icon-32.png"/>
  <HighResolutionIconUrl DefaultValue="https://your-domain.com/icon-64.png"/>
  <SupportUrl DefaultValue="https://your-domain.com/"/>
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
        <SourceLocation DefaultValue="https://your-domain.com/"/>
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
        <bt:Image id="Icon.16x16" DefaultValue="https://your-domain.com/icon-16.png"/>
        <bt:Image id="Icon.32x32" DefaultValue="https://your-domain.com/icon-32.png"/>
        <bt:Image id="Icon.80x80" DefaultValue="https://your-domain.com/icon-80.png"/>
      </bt:Images>
      <bt:Urls>
        <bt:Url id="Commands.Url" DefaultValue="https://your-domain.com/"/>
        <bt:Url id="Taskpane.Url" DefaultValue="https://your-domain.com/"/>
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

**Important:** Replace all instances of `https://your-domain.com` with your actual deployed URL.

### Step 2: Sideload in Outlook Web

1. Go to [Outlook Web](https://outlook.office.com)
2. Click Settings (gear icon) → View all Outlook settings
3. Navigate to "General" → "Manage add-ins"
4. Click "My add-ins" in the left panel
5. Under "Custom add-ins", click "+ Add a custom add-in" → "Add from file"
6. Upload your `manifest.xml` file
7. Click "Install" to confirm

### Step 3: Sideload in Outlook Desktop

1. Open Outlook Desktop
2. Go to File → Get Add-ins → My Add-ins
3. Click "Add a custom add-in" → "Add from file"
4. Select your `manifest.xml` file
5. Click "OK" to install

### Step 4: Test the Plugin

1. Open any email in Outlook
2. Look for "Customer Support AI" in the ribbon or add-in panel
3. Click to open the taskpane
4. The plugin should load and display the interface

## Configuration

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `SESSION_SECRET` | Yes | Secret key for encrypting sessions (32+ chars) |
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `OPENAI_BASE_URL` | No | OpenAI API endpoint (default: https://api.openai.com/v1) |
| `GMAIL_CLIENT_ID` | Yes | Google OAuth client ID |
| `GMAIL_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `GMAIL_REDIRECT_URI` | Yes | OAuth callback URL |
| `GMAIL_REFRESH_TOKEN` | Yes | Gmail OAuth refresh token |
| `ORGANIZATION_DOMAIN` | No | Your company domain (default: example.com) |
| `ORGANIZATION_EMAIL` | No | Support email address |
| `ORDER_API_URL` | No | Order management system API endpoint |
| `ORDER_API_KEY` | No | Order API authentication key |
| `SHIPPING_API_URL` | No | Shipping provider API endpoint |
| `SHIPPING_API_KEY` | No | Shipping API authentication key |

### Updating Organization Settings

Edit `server/routes.ts` to configure your organization:

```typescript
const organizationDomain = process.env.ORGANIZATION_DOMAIN || 'your-company.com';
```

## API Integration

### Integrating Order Management System

Update `server/services/external-apis.ts`:

```typescript
export async function lookupAWBFromOrder(orderNumber: string): Promise<{ awbNumber: string }> {
  const response = await fetch(`${process.env.ORDER_API_URL}/orders/${orderNumber}`, {
    headers: {
      'Authorization': `Bearer ${process.env.ORDER_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return { awbNumber: data.tracking_number };
}
```

### Integrating Shipping Provider

Update the `getShipmentTracking` function in `server/services/external-apis.ts`:

```typescript
export async function getShipmentTracking(awbNumber: string): Promise<ShippingStatus> {
  const response = await fetch(`${process.env.SHIPPING_API_URL}/track/${awbNumber}`, {
    headers: {
      'Authorization': `Bearer ${process.env.SHIPPING_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  // Map your API response to ShippingStatus interface
  return {
    currentStatus: data.status,
    currentLocation: data.location,
    // ... map other fields
  };
}
```

## Using the Plugin

### Basic Workflow

1. **Open the Plugin** - Click "Customer Support AI" when viewing a customer email
2. **Analyze Email History** - Click "Analyze Customer History"
3. **Review Insights** - View customer info, email timeline, and AI analysis
4. **Generate Response** - Review the AI-generated draft
5. **Edit & Send** - Make edits and send the response

### Advanced Features

- **Refresh Tracking** - Get latest shipment status
- **Regenerate Response** - Create new AI draft
- **Dynamic Questions** - Answer follow-up questions based on issues
- **AWB Communications** - View all emails related to shipment

## Troubleshooting

### Common Issues

**Plugin Not Loading**
- Verify your deployed URL is accessible via HTTPS
- Check browser console for errors
- Ensure manifest.xml URLs are correct
- Clear Outlook cache and reload

**Gmail Authentication Errors**
- Verify OAuth credentials are correct
- Check redirect URI matches exactly
- Ensure Gmail API is enabled in Google Cloud Console
- Regenerate refresh token if expired

**OpenAI API Errors**
- Verify API key is valid
- Check account has credits/billing enabled
- Review rate limits and quotas
- Check model availability (gpt-5 vs gpt-4.1)

**Docker Container Not Starting**
- Check environment variables are set correctly
- Review container logs: `docker-compose logs`
- Verify port 5000 is not in use
- Ensure sufficient memory allocated

**CORS Errors**
- Application is configured for cross-origin requests
- If behind reverse proxy, ensure proper headers are set
- Check manifest URLs match deployment domain

### Debugging

**View Application Logs**
```bash
# Docker
docker-compose logs -f

# Local
npm run dev  # logs appear in console
```

**Check Health Status**
```bash
curl http://localhost:5000/health
```

**Test Gmail Connection**
```bash
# Make a test API call to verify Gmail setup
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"customerEmail": "test@example.com"}'
```

## Architecture

### Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **AI**: OpenAI GPT-5
- **Email**: Gmail API
- **Build Tool**: Vite
- **Storage**: In-memory (session-based)

### Project Structure

```
.
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # UI components
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
├── Dockerfile             # Docker image definition
├── docker-compose.yml     # Docker Compose configuration
└── manifest.xml           # Outlook add-in manifest
```

### API Endpoints

- `POST /api/analyze` - Analyze customer email history
- `POST /api/lookup-awb` - Retrieve AWB from order number
- `POST /api/track-shipment` - Get shipment tracking status
- `POST /api/regenerate-response` - Generate new AI response
- `POST /api/send-response` - Send email response

## Security Best Practices

- Store all secrets in environment variables, never in code
- Use HTTPS in production
- Rotate API keys and tokens regularly
- Implement rate limiting for API endpoints
- Keep dependencies up to date
- Use strong session secrets (32+ random characters)
- Restrict Gmail OAuth scopes to minimum required
- Enable logging and monitoring
- Regular security audits

## Performance Optimization

- Enable response caching where appropriate
- Use connection pooling for external APIs
- Implement request queuing for rate-limited APIs
- Monitor and optimize AI token usage
- Use CDN for static assets
- Enable gzip compression

## License

[Add your license information here]

## Support

For issues or questions:
- Check application logs
- Review browser console
- Verify all environment variables are set
- Test with simple email first
- Contact your development team

## Acknowledgments

- UI components from Shadcn
- Icons from Lucide React
- AI powered by OpenAI GPT-5
- Gmail integration via Google APIs

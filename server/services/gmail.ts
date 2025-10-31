// Based on blueprint: google-mail
import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.CONNECTORS_HOSTNAME || process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xAuthToken = process.env.REPL_IDENTITY 
    ? 'dev ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'prod ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xAuthToken) {
    throw new Error('Authentication token not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xAuthToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Gmail not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableGmailClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

interface EmailThread {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  snippet: string;
  body: string;
  timestamp: string;
  isFromOrganization: boolean;
  threadId?: string;
}

export async function getEmailsByCustomer(customerEmail: string, organizationDomain: string = 'example.com'): Promise<EmailThread[]> {
  let gmail;
  try {
    gmail = await getUncachableGmailClient();
  } catch (error) {
    console.error('Gmail client initialization failed:', error);
    throw new Error('Gmail connection not available. Please set up the Gmail integration.');
  }

  // Search for emails from or to the customer
  const query = `from:${customerEmail} OR to:${customerEmail}`;
  
  const response = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 50, // Get last 50 emails
  });

  const messages = response.data.messages || [];
  const emails: EmailThread[] = [];

  // Fetch full message details
  for (const message of messages) {
    if (!message.id) continue;

    const fullMessage = await gmail.users.messages.get({
      userId: 'me',
      id: message.id,
      format: 'full',
    });

    const headers = fullMessage.data.payload?.headers || [];
    const getHeader = (name: string) => headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

    const from = getHeader('From');
    const subject = getHeader('Subject');
    const date = getHeader('Date');
    
    // Extract email address from "Name <email@domain.com>" format
    const fromEmail = from.match(/<(.+?)>/)?.[1] || from;
    const senderName = from.replace(/<.+?>/, '').trim() || fromEmail;

    // Determine if email is from organization
    const isFromOrganization = fromEmail.includes(organizationDomain);

    // Extract body
    let body = fullMessage.data.snippet || '';
    if (fullMessage.data.payload?.parts) {
      const textPart = fullMessage.data.payload.parts.find(p => p.mimeType === 'text/plain');
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
    } else if (fullMessage.data.payload?.body?.data) {
      body = Buffer.from(fullMessage.data.payload.body.data, 'base64').toString('utf-8');
    }

    emails.push({
      id: message.id,
      sender: senderName,
      senderEmail: fromEmail,
      subject: subject || '(No subject)',
      snippet: fullMessage.data.snippet || '',
      body: body.substring(0, 2000), // Limit body length
      timestamp: new Date(fullMessage.data.internalDate ? parseInt(fullMessage.data.internalDate) : date).toISOString(),
      isFromOrganization,
      threadId: fullMessage.data.threadId || undefined,
    });
  }

  // Sort by timestamp (oldest first for chronological order)
  return emails.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export async function searchEmailsByAWB(awbNumber: string, organizationDomain: string = 'example.com'): Promise<EmailThread[]> {
  let gmail;
  try {
    gmail = await getUncachableGmailClient();
  } catch (error) {
    console.error('Gmail client initialization failed:', error);
    return []; // Return empty array if Gmail is not available
  }

  // Search for emails containing the AWB number
  const query = `"${awbNumber}"`;
  
  const response = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 20,
  });

  const messages = response.data.messages || [];
  const emails: EmailThread[] = [];

  for (const message of messages) {
    if (!message.id) continue;

    const fullMessage = await gmail.users.messages.get({
      userId: 'me',
      id: message.id,
      format: 'full',
    });

    const headers = fullMessage.data.payload?.headers || [];
    const getHeader = (name: string) => headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

    const from = getHeader('From');
    const subject = getHeader('Subject');
    const date = getHeader('Date');
    
    const fromEmail = from.match(/<(.+?)>/)?.[1] || from;
    const senderName = from.replace(/<.+?>/, '').trim() || fromEmail;
    const isFromOrganization = fromEmail.includes(organizationDomain);

    let body = fullMessage.data.snippet || '';
    if (fullMessage.data.payload?.parts) {
      const textPart = fullMessage.data.payload.parts.find(p => p.mimeType === 'text/plain');
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      }
    } else if (fullMessage.data.payload?.body?.data) {
      body = Buffer.from(fullMessage.data.payload.body.data, 'base64').toString('utf-8');
    }

    emails.push({
      id: message.id,
      sender: senderName,
      senderEmail: fromEmail,
      subject: subject || '(No subject)',
      snippet: fullMessage.data.snippet || '',
      body: body.substring(0, 2000),
      timestamp: new Date(fullMessage.data.internalDate ? parseInt(fullMessage.data.internalDate) : date).toISOString(),
      isFromOrganization,
      threadId: fullMessage.data.threadId || undefined,
    });
  }

  return emails.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  let gmail;
  try {
    gmail = await getUncachableGmailClient();
  } catch (error) {
    console.error('Gmail client initialization failed:', error);
    throw new Error('Gmail connection not available. Cannot send email.');
  }

  const email = [
    `To: ${to}`,
    `Subject: ${subject}`,
    '',
    body,
  ].join('\n');

  const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedEmail,
    },
  });
}

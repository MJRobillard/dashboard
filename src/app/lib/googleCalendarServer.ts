import { google } from 'googleapis';

// Google OAuth 2.0 configuration
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Scopes for Google Calendar access
export const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly'
];

// Get dynamic redirect URI based on environment
const getRedirectUri = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.GOOGLE_REDIRECT_URI || 'https://yourdomain.com/google-callback';
  }
  // For development, use localhost:3000 by default
  return 'http://localhost:3000/google-callback';
};

// Initialize Google OAuth 2.0 client
export const createGoogleAuthClient = () => {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    getRedirectUri()
  );
};

// Exchange authorization code for tokens
export const exchangeCodeForTokens = async (code: string) => {
  const auth = createGoogleAuthClient();
  const { tokens } = await auth.getToken(code);
  return tokens;
};

// Get user's calendars
export const getUserCalendars = async (accessToken: string) => {
  const auth = createGoogleAuthClient();
  auth.setCredentials({ access_token: accessToken });
  
  const calendar = google.calendar({ version: 'v3', auth });
  const response = await calendar.calendarList.list();
  
  return response.data.items || [];
};

// Get calendar events
export const getCalendarEvents = async (
  accessToken: string, 
  calendarId: string, 
  timeMin?: string, 
  timeMax?: string
) => {
  const auth = createGoogleAuthClient();
  auth.setCredentials({ access_token: accessToken });
  
  const calendar = google.calendar({ version: 'v3', auth });
  const response = await calendar.events.list({
    calendarId,
    timeMin: timeMin || new Date().toISOString(),
    timeMax: timeMax || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    singleEvents: true,
    orderBy: 'startTime'
  });
  
  return response.data.items || [];
};

// Add event to calendar
export const addCalendarEvent = async (
  accessToken: string,
  calendarId: string,
  event: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone?: string };
    end: { dateTime: string; timeZone?: string };
    location?: string;
  }
) => {
  const auth = createGoogleAuthClient();
  auth.setCredentials({ access_token: accessToken });
  
  const calendar = google.calendar({ version: 'v3', auth });
  const response = await calendar.events.insert({
    calendarId,
    requestBody: event
  });
  
  return response.data;
};

// Refresh access token
export const refreshAccessToken = async (refreshToken: string) => {
  const auth = createGoogleAuthClient();
  auth.setCredentials({ refresh_token: refreshToken });
  
  const { credentials } = await auth.refreshAccessToken();
  return credentials;
}; 
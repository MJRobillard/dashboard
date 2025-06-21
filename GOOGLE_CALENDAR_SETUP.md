# Google Calendar Integration Setup

This guide walks you through setting up Google Calendar OAuth integration for the Fitness Dashboard.

## Prerequisites

1. A Google Cloud Platform account
2. Google Calendar API enabled
3. OAuth 2.0 credentials configured

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add authorized redirect URIs:
   - `http://localhost:3000/google-callback` (for development)
   - `https://yourdomain.com/google-callback` (for production)
5. Note down your Client ID and Client Secret

## Step 3: Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Google OAuth 2.0 Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Existing Firebase and other configurations...
```

## Step 4: OAuth Scopes

The application requests the following Google Calendar scopes:
- `https://www.googleapis.com/auth/calendar.readonly` - Read calendar events
- `https://www.googleapis.com/auth/calendar.events` - Create and modify events

## Step 5: Testing the Integration

1. Start your development server: `npm run dev`
2. Navigate to the dashboard
3. Click "Connect with Google" in the Google Calendar section
4. Complete the OAuth flow
5. Select a calendar to display

## Features

- **OAuth 2.0 Authentication**: Secure authentication with Google
- **Multiple Calendar Support**: Switch between different calendars
- **Automatic Token Refresh**: Handles token expiration automatically
- **Event Creation**: Add workout events directly to Google Calendar
- **Persistent Authentication**: Tokens stored securely in localStorage

## Security Notes

- Client Secret should never be exposed to the client-side
- All OAuth token exchange happens server-side via API routes
- Tokens are stored locally and can be cleared by users
- The application only requests necessary calendar permissions

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**:
   - Ensure the redirect URI in Google Cloud Console matches exactly
   - Check that the callback URL is `/google-callback`

2. **"Access denied" error**:
   - Verify that Google Calendar API is enabled
   - Check that OAuth consent screen is configured

3. **"Client ID not found" error**:
   - Ensure environment variables are set correctly
   - Restart the development server after adding environment variables

### Debug Mode

To enable debug logging, add this to your environment variables:
```env
DEBUG=googleapis:*
```

## API Endpoints

The integration uses the following API routes:

- `POST /api/google-calendar/auth` - Exchange authorization code for tokens
- `GET /api/google-calendar/auth` - Fetch calendar events
- `POST /api/google-calendar/refresh` - Refresh access tokens

## File Structure

```
src/app/
├── api/google-calendar/
│   ├── auth/route.ts          # OAuth token exchange
│   └── refresh/route.ts       # Token refresh
├── contexts/
│   └── GoogleCalendarContext.tsx  # React context for state management
├── utils/
│   └── googleCalendar.ts      # Google Calendar API utilities
├── google-callback/
│   └── page.tsx               # OAuth callback handler
└── page.tsx                   # Main dashboard (updated)
``` 
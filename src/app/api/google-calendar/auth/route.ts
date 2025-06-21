import { NextRequest, NextResponse } from 'next/server';
import { 
  createGoogleAuthClient, 
  exchangeCodeForTokens, 
  getUserCalendars,
  getCalendarEvents 
} from '../../../lib/googleCalendarServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, accessToken } = body;
    
    // If we have an access token, just load calendars (for existing auth)
    if (accessToken && !code) {
      const calendars = await getUserCalendars(accessToken);
      return NextResponse.json({
        success: true,
        calendars
      });
    }
    
    // Otherwise, handle normal authentication flow
    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code);
    
    if (!tokens.access_token) {
      return NextResponse.json({ error: 'Failed to get access token' }, { status: 400 });
    }

    // Get user's calendars
    const calendars = await getUserCalendars(tokens.access_token);
    
    return NextResponse.json({
      success: true,
      tokens,
      calendars
    });
    
  } catch (error) {
    console.error('Google Calendar auth error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate with Google Calendar' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('accessToken');
    const calendarId = searchParams.get('calendarId');
    
    if (!accessToken || !calendarId) {
      return NextResponse.json(
        { error: 'Access token and calendar ID are required' }, 
        { status: 400 }
      );
    }

    // Get calendar events
    const events = await getCalendarEvents(accessToken, calendarId);
    
    return NextResponse.json({
      success: true,
      events
    });
    
  } catch (error) {
    console.error('Google Calendar events error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' }, 
      { status: 500 }
    );
  }
} 
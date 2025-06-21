import { NextRequest, NextResponse } from 'next/server';
import { addCalendarEvent } from '../../../lib/googleCalendarServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      accessToken, 
      calendarId, 
      summary, 
      description, 
      startDateTime, 
      endDateTime, 
      location 
    } = body;
    
    if (!accessToken || !calendarId || !summary || !startDateTime || !endDateTime) {
      return NextResponse.json(
        { error: 'Missing required fields: accessToken, calendarId, summary, startDateTime, endDateTime' }, 
        { status: 400 }
      );
    }

    // Create the event
    const event = await addCalendarEvent(accessToken, calendarId, {
      summary,
      description: description || '',
      start: { 
        dateTime: startDateTime, 
        timeZone: 'America/Los_Angeles' 
      },
      end: { 
        dateTime: endDateTime, 
        timeZone: 'America/Los_Angeles' 
      },
      location: location || ''
    });
    
    return NextResponse.json({
      success: true,
      event
    });
    
  } catch (error) {
    console.error('Google Calendar create event error:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' }, 
      { status: 500 }
    );
  }
} 
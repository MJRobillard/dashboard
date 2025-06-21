# Google Calendar Integration in Personal Calendar

## Overview

The Google Calendar integration has been successfully implemented to display the current user's Google Calendar events directly in the Personal Calendar section of the Fitness Dashboard.

## How It Works

### 1. Authentication Flow
- Users click "Connect with Google" in the Google Calendar section
- OAuth 2.0 flow authenticates with Google Calendar API
- Access tokens are stored securely in localStorage
- Automatic token refresh handles expiration

### 2. Event Integration
- Google Calendar events are fetched for the next 7 days
- Events are converted to the app's `CalendarEvent` format
- Combined with personal events in the `combinedEvents` array
- Displayed in the PersonalScheduleGrid component

### 3. Visual Distinction
- **Personal Events**: Gray background (`bg-slate-700/90`)
- **Google Calendar Events**: Green background (`bg-green-700/90`) with 📅 icon
- Legend shows event types when Google Calendar is connected

## Key Components

### GoogleCalendarContext (`src/app/contexts/GoogleCalendarContext.tsx`)
- Manages authentication state
- Handles token storage and refresh
- Fetches calendar events
- Provides calendar selection

### Event Conversion (`src/app/utils/googleCalendar.ts`)
- Converts Google Calendar API events to app format
- Handles different time formats (dateTime vs date)
- Adds proper metadata for identification

### PersonalScheduleGrid (`src/app/page.tsx`)
- Displays combined events (personal + Google)
- Shows connection status in header
- Provides visual legend for event types
- Handles drag-and-drop for personal events only

## Features

### ✅ Implemented
- OAuth 2.0 authentication
- Automatic event fetching (next 7 days)
- Visual distinction between event types
- Connection status indicator
- Event count display
- Proper time formatting
- All-day event support

### 🔧 Technical Details
- **Date Range**: Events fetched for next 7 days to match personal calendar view
- **Time Format**: Consistent 12-hour format (e.g., "2:30 PM")
- **Event Filtering**: Only shows events within the calendar grid time slots (6 AM - 10 PM)
- **Error Handling**: Graceful fallback if Google Calendar is unavailable

## Usage

1. **Connect Google Calendar**:
   - Click "Connect with Google" in the Google Calendar section
   - Complete OAuth flow
   - Select desired calendar

2. **View Combined Events**:
   - Google Calendar events appear automatically in Personal Schedule
   - Green background indicates Google Calendar events
   - Personal events remain editable and draggable

3. **Event Management**:
   - Personal events can be edited, deleted, or moved
   - Google Calendar events are read-only (cannot be modified in-app)
   - Both types show in the same unified view

## Debugging

The integration includes console logging for debugging:
- Event conversion details
- Combined events count
- Google Calendar connection status
- Event fetching parameters

Check browser console for detailed integration logs.

## Security

- Client secret never exposed to frontend
- All OAuth token exchange happens server-side
- Tokens stored locally with user consent
- Proper scope limitations (read-only + events)

## Future Enhancements

Potential improvements:
- Two-way sync (create events from app to Google Calendar)
- Calendar color coding
- Event conflict detection
- Recurring event support
- Multiple calendar support with priority 
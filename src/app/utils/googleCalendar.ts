// Client-side Google Calendar utilities
// Server-side functions are in the API routes

// Store tokens in localStorage (for client-side)
export const storeTokens = (tokens: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('google_calendar_tokens', JSON.stringify(tokens));
  }
};

// Get stored tokens from localStorage
export const getStoredTokens = () => {
  if (typeof window !== 'undefined') {
    const tokens = localStorage.getItem('google_calendar_tokens');
    return tokens ? JSON.parse(tokens) : null;
  }
  return null;
};

// Clear stored tokens
export const clearStoredTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('google_calendar_tokens');
  }
};

// Generate OAuth URL for Google Calendar access (client-side)
export const generateGoogleAuthUrl = () => {
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = typeof window !== 'undefined' 
    ? `${window.location.origin}/google-callback`
    : 'http://localhost:3000/google-callback';
    
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events'
  ];
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID || '',
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent'
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

// Convert Google Calendar events to CalendarEvent format
export const convertGoogleEventsToCalendarEvents = (googleEvents: any[]): any[] => {
  return googleEvents.map(event => {
    const startDate = event.start.dateTime || event.start.date;
    const endDate = event.end.dateTime || event.end.date;
    
    // Parse the date and time
    const start = new Date(startDate);
    const date = start.toISOString().split('T')[0];
    
    // Format time (e.g., "2:30 PM") - ensure consistent format
    let time = '';
    if (event.start.dateTime) {
      const hours = start.getHours();
      const minutes = start.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      time = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } else if (event.start.date) {
      // All-day events
      time = 'All Day';
    }
    
    console.log('Converting Google event:', {
      original: event.summary,
      date,
      time,
      startDate,
      endDate
    });
    
    return {
      id: `google-${event.id}`,
      date: date,
      title: event.summary || 'Untitled Event',
      type: 'google',
      time: time,
      location: event.location || '',
      notes: event.description || '',
      isPersonal: false,
      isGoogleEvent: true,
      originalEvent: event
    };
  });
}; 
"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generateGoogleAuthUrl, storeTokens, getStoredTokens, clearStoredTokens } from '../utils/googleCalendar';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useFirebase } from './FirebaseContext';

interface GoogleCalendarTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date?: number;
}

interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  accessRole: string;
}

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
}

interface GoogleCalendarContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: GoogleCalendarTokens | null;
  calendars: GoogleCalendar[];
  selectedCalendar: GoogleCalendar | null;
  googleEvents: GoogleCalendarEvent[];
  authenticate: () => void;
  handleAuthCallback: (code: string) => Promise<void>;
  selectCalendar: (calendar: GoogleCalendar) => void;
  disconnect: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  fetchCalendarEvents: (timeMin?: string, timeMax?: string) => Promise<void>;
  createEvent: (eventData: {
    summary: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
    location?: string;
  }) => Promise<{ success: boolean; event?: any; error?: string }>;
}

const GoogleCalendarContext = createContext<GoogleCalendarContextType>({
  isAuthenticated: false,
  isLoading: false,
  tokens: null,
  calendars: [],
  selectedCalendar: null,
  googleEvents: [],
  authenticate: () => {},
  handleAuthCallback: async () => {},
  selectCalendar: () => {},
  disconnect: async () => {},
  refreshTokens: async () => {},
  fetchCalendarEvents: async () => {},
  createEvent: async () => ({ success: false }),
});

export const useGoogleCalendar = () => useContext(GoogleCalendarContext);

// Firestore collection for storing per-user Google Calendar tokens
const GCAL_TOKENS_COLLECTION = 'googleCalendarTokens';

interface FirestoreGCalDoc {
  tokens: GoogleCalendarTokens;
  calendars?: GoogleCalendar[];
  selectedCalendarId?: string | null;
}

const saveUserGCalData = async (
  uid: string,
  data: Partial<FirestoreGCalDoc>
) => {
  try {
    await setDoc(doc(db, GCAL_TOKENS_COLLECTION, uid), data, { merge: true });
  } catch (err) {
    console.error('Error saving Google Calendar data to Firestore:', err);
  }
};

const deleteTokensForUser = async (uid: string) => {
  try {
    await deleteDoc(doc(db, GCAL_TOKENS_COLLECTION, uid));
  } catch (err) {
    console.error('Error deleting Google Calendar tokens from Firestore:', err);
  }
};

const loadUserGCalData = async (
  uid: string
): Promise<FirestoreGCalDoc | null> => {
  try {
    const snap = await getDoc(doc(db, GCAL_TOKENS_COLLECTION, uid));
    if (snap.exists()) {
      return snap.data() as FirestoreGCalDoc;
    }
  } catch (err) {
    console.error('Error loading Google Calendar tokens from Firestore:', err);
  }
  return null;
};

export const GoogleCalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState<GoogleCalendarTokens | null>(null);
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<GoogleCalendar | null>(null);
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
  const { user } = useFirebase();

  // Load tokens either from localStorage or Firestore whenever the user changes / on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        // 1) Try localStorage first for quick load
        const local = getStoredTokens();
        if (local && local.access_token) {
          setTokens(local);
          setIsAuthenticated(true);
          
          // If we have tokens, try to load calendars and events
          await loadCalendarsAndEvents(local);
          return;
        }

        // 2) If user logged in, attempt Firestore
        if (user) {
          const cloudData = await loadUserGCalData(user.uid);
          if (cloudData && cloudData.tokens && cloudData.tokens.access_token) {
            setTokens(cloudData.tokens);
            setIsAuthenticated(true);
            storeTokens(cloudData.tokens); // cache locally for faster subsequent loads

            if (cloudData.calendars) setCalendars(cloudData.calendars);
            if (cloudData.selectedCalendarId) {
              const found = cloudData.calendars?.find(c=>c.id===cloudData.selectedCalendarId) || null;
              if (found) setSelectedCalendar(found);
            }
            
            // Load events if we have a selected calendar
            if (cloudData.selectedCalendarId && cloudData.calendars) {
              const found = cloudData.calendars.find(c=>c.id===cloudData.selectedCalendarId);
              if (found) {
                console.log('Restoring selected calendar from Firestore:', found.summary);
                setSelectedCalendar(found);
                // Events will be fetched by the useEffect that watches selectedCalendar
              }
            }
          }
        }
      } catch (error) {
        console.error('Error initializing Google Calendar:', error);
        // If there's an error, clear the stored tokens and try to refresh
        if (tokens?.refresh_token) {
          await refreshTokens();
        }
      } finally {
        setIsLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Check if tokens are expired
  useEffect(() => {
    if (tokens && tokens.expiry_date && Date.now() > tokens.expiry_date) {
      // Handle expired tokens in the refreshTokens function itself
      console.log('Tokens expired, will handle in refreshTokens function');
    }
  }, [tokens]);

  // Persist tokens to Firestore whenever they change (and user is logged in)
  useEffect(() => {
    if (user && tokens && tokens.access_token) {
      saveUserGCalData(user.uid, { tokens, calendars, selectedCalendarId: selectedCalendar?.id || null });
    }
  }, [tokens, calendars, selectedCalendar, user]);

  const authenticate = useCallback(() => {
    const authUrl = generateGoogleAuthUrl();
    window.location.href = authUrl;
  }, []);

  const handleAuthCallback = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/google-calendar/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.success) {
        setTokens(data.tokens);
        setCalendars(data.calendars);
        setIsAuthenticated(true);
        storeTokens(data.tokens);
        
        // Auto-select primary calendar if available
        const primaryCalendar = data.calendars.find((cal: GoogleCalendar) => cal.primary);
        if (primaryCalendar) {
          setSelectedCalendar(primaryCalendar);
        }
      } else {
        throw new Error(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Google Calendar authentication error:', error);
      disconnect();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectCalendar = useCallback((calendar: GoogleCalendar) => {
    setSelectedCalendar(calendar);
  }, []);

  const disconnect = useCallback(async () => {
    setTokens(null);
    setCalendars([]);
    setSelectedCalendar(null);
    setGoogleEvents([]);
    setIsAuthenticated(false);
    clearStoredTokens();

    if (user) {
      await deleteTokensForUser(user.uid);
    }
  }, [user]);

  const refreshTokens = useCallback(async () => {
    if (!tokens?.refresh_token) {
      console.log('No refresh token available, disconnecting...');
      disconnect();
      return;
    }

    try {
      console.log('Refreshing Google Calendar tokens...');
      const response = await fetch('/api/google-calendar/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tokens.refresh_token }),
      });

      const data = await response.json();

      if (data.success) {
        const newTokens = { ...tokens, ...data.tokens };
        console.log('Tokens refreshed successfully');
        setTokens(newTokens);
        storeTokens(newTokens);
        
        // Events will be refetched by the useEffect that watches tokens
      } else {
        console.error('Token refresh failed:', data.error);
        disconnect();
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      disconnect();
    }
  }, [tokens, disconnect]);

  const fetchCalendarEvents = useCallback(async (timeMin?: string, timeMax?: string) => {
    if (!selectedCalendar || !tokens?.access_token) {
      console.log('Cannot fetch events: missing calendar or tokens');
      return;
    }

    try {
      // Check if token is expired and refresh if needed
      if (tokens.expiry_date && Date.now() > tokens.expiry_date) {
        console.log('Token expired, refreshing...');
        await refreshTokens();
        return; // The refresh will trigger a re-fetch
      }

      // Default to next 7 days if no time range specified
      const startDate = timeMin || new Date().toISOString();
      const endDate = timeMax || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      console.log('Fetching Google Calendar events:', {
        calendarId: selectedCalendar.id,
        startDate,
        endDate
      });

      const params = new URLSearchParams({
        accessToken: tokens.access_token,
        calendarId: selectedCalendar.id,
        timeMin: startDate,
        timeMax: endDate,
      });

      const response = await fetch(`/api/google-calendar/auth?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        console.log('Google Calendar events fetched:', data.events.length);
        setGoogleEvents(data.events);
      } else {
        console.error('Failed to fetch calendar events:', data.error);
        // If token is invalid, try to refresh
        if (data.error?.includes('invalid') || data.error?.includes('expired') || data.error?.includes('401')) {
          console.log('Token appears invalid, attempting refresh...');
          await refreshTokens();
        }
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      // If there's a network error or token issue, try to refresh tokens
      if (tokens?.refresh_token) {
        console.log('Attempting to refresh tokens due to fetch error...');
        await refreshTokens();
      }
    }
  }, [selectedCalendar, tokens, refreshTokens]);

  // Helper function to load calendars and events
  const loadCalendarsAndEvents = async (tokens: GoogleCalendarTokens) => {
    try {
      console.log('Loading calendars and events with existing tokens...');
      
      // Load calendars
      const response = await fetch('/api/google-calendar/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: null, // This will be handled by the server to just get calendars
          accessToken: tokens.access_token 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Calendars loaded:', data.calendars?.length || 0);
        
        if (data.calendars) {
          setCalendars(data.calendars);
          
          // Auto-select primary calendar if available
          const primaryCalendar = data.calendars.find((cal: GoogleCalendar) => cal.primary);
          if (primaryCalendar) {
            console.log('Auto-selecting primary calendar:', primaryCalendar.summary);
            setSelectedCalendar(primaryCalendar);
            // Events will be fetched by the useEffect that watches selectedCalendar
          } else if (data.calendars.length > 0) {
            console.log('No primary calendar, selecting first available:', data.calendars[0].summary);
            setSelectedCalendar(data.calendars[0]);
          }
        }
      } else {
        console.error('Failed to load calendars:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
        
        // If we get a 401, try to refresh tokens
        if (response.status === 401 && tokens.refresh_token) {
          console.log('Unauthorized, attempting token refresh...');
          await refreshTokens();
        }
      }
    } catch (error) {
      console.error('Error loading calendars and events:', error);
    }
  };

  // Handle expired tokens
  useEffect(() => {
    if (tokens && tokens.expiry_date && Date.now() > tokens.expiry_date) {
      if (tokens.refresh_token) {
        refreshTokens();
      } else {
        disconnect();
      }
    }
  }, [tokens, refreshTokens, disconnect]);

  // Refetch events when tokens are refreshed
  useEffect(() => {
    if (tokens?.access_token && selectedCalendar && isAuthenticated) {
      // Small delay to ensure state is settled after token refresh
      const timer = setTimeout(() => {
        console.log('Tokens updated, refetching events...');
        fetchCalendarEvents();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [tokens?.access_token, selectedCalendar, isAuthenticated, fetchCalendarEvents]);

  // Fetch events when calendar is selected
  useEffect(() => {
    if (selectedCalendar && tokens?.access_token) {
      console.log('Calendar selected, fetching events...');
      fetchCalendarEvents();
    }
  }, [selectedCalendar, tokens, fetchCalendarEvents]);

  // Auto-fetch events when authentication state changes or on mount
  useEffect(() => {
    if (isAuthenticated && selectedCalendar && tokens?.access_token && !isLoading) {
      console.log('Auto-fetching calendar events on mount/state change...');
      fetchCalendarEvents();
    }
  }, [isAuthenticated, selectedCalendar, tokens, fetchCalendarEvents, isLoading]);

  const createEvent = useCallback(async (eventData: {
    summary: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
    location?: string;
  }) => {
    if (!selectedCalendar || !tokens?.access_token) {
      return { success: false };
    }

    try {
      const response = await fetch('/api/google-calendar/create-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventData,
          accessToken: tokens.access_token,
          calendarId: selectedCalendar.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('Event created successfully');
          return { success: true, event: data.event };
        } else {
          console.error('Failed to create event:', data.error);
          return { success: false, error: data.error };
        }
      } else {
        console.error('Error creating event:', response.status, response.statusText);
        return { success: false };
      }
    } catch (error) {
      console.error('Error creating event:', error);
      return { success: false };
    }
  }, [selectedCalendar, tokens]);

  const value: GoogleCalendarContextType = {
    isAuthenticated,
    isLoading,
    tokens,
    calendars,
    selectedCalendar,
    googleEvents,
    authenticate,
    handleAuthCallback,
    selectCalendar,
    disconnect,
    refreshTokens,
    fetchCalendarEvents,
    createEvent,
  };

  return (
    <GoogleCalendarContext.Provider value={value}>
      {children}
    </GoogleCalendarContext.Provider>
  );
}; 
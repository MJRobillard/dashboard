'use client';

import React, { useState } from 'react';
import { GoogleCalendarViews } from '../components/GoogleCalendarViews';
import { useGoogleCalendar } from '../contexts/GoogleCalendarContext';

const CalendarDemo: React.FC = () => {
  const [personalEvents, setPersonalEvents] = useState([
    {
      id: 'demo-1',
      date: new Date().toISOString().split('T')[0],
      title: 'Morning Workout',
      type: 'personal',
      time: '7:00 AM',
      notes: 'Cardio and strength training',
      isPersonal: true
    },
    {
      id: 'demo-2',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      title: 'Team Meeting',
      type: 'personal',
      time: '2:00 PM',
      notes: 'Weekly team sync',
      isPersonal: true
    }
  ]);

  const { isAuthenticated, authenticate, selectedCalendar, googleEvents } = useGoogleCalendar();

  // Convert Google events to the app format
  const combinedEvents = [...personalEvents, ...googleEvents.map(event => {
    // Handle potentially undefined date values
    const startDate = event.start.dateTime || event.start.date;
    if (!startDate) {
      console.warn('Google event missing start date:', event);
      return null;
    }

    return {
      id: `google-${event.id}`,
      date: new Date(startDate).toISOString().split('T')[0],
      title: event.summary || 'Untitled Event',
      type: 'google',
      time: event.start.dateTime ? new Date(event.start.dateTime).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }) : 'All Day',
      notes: event.description || '',
      isPersonal: false,
      isGoogleEvent: true
    };
  }).filter((event): event is NonNullable<typeof event> => event !== null)]; // Type-safe filter

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-300 mb-4">Google Calendar Components Demo</h1>
          <p className="text-white/75 text-lg">
            Explore different ways to display and interact with Google Calendar events
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-yellow-300/20 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-yellow-300 text-xl font-bold mb-2">Google Calendar Status</h3>

            </div>
            {!isAuthenticated && (
              <button
                onClick={authenticate}
                className="px-6 py-3 bg-yellow-300 text-blue-950 rounded-xl text-sm font-semibold transition-all hover:bg-yellow-400"
              >
                Connect Google Calendar
              </button>
            )}
          </div>
        </div>

        {/* Component Showcase */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-yellow-300 mb-4">Enhanced Calendar Views</h2>
            <p className="text-white/75 mb-6">
              This component includes multiple view options: React Big Calendar (Month/Week/Day), 
              Timeline view, and embedded Google Calendar iframe.
            </p>
            <GoogleCalendarViews 
              personalEvents={personalEvents}
              setPersonalEvents={setPersonalEvents}
              combinedEvents={combinedEvents}
            />
          </div>

          {/* Component Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-800/30 to-blue-900/30 border border-blue-300/20 rounded-xl p-6">
              <h3 className="text-blue-300 text-xl font-bold mb-3">Available Components</h3>
              <ul className="space-y-2 text-white/75">
                <li>• <strong>React Big Calendar</strong> - Full-featured calendar with multiple views</li>
                <li>• <strong>Timeline View</strong> - Custom weekly timeline with time slots</li>
                <li>• <strong>Google Calendar iframe</strong> - Embedded Google Calendar</li>
                <li>• <strong>Event Conversion</strong> - Convert between different event formats</li>
                <li>• <strong>Drag & Drop</strong> - Move events between time slots</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-800/30 to-green-900/30 border border-green-300/20 rounded-xl p-6">
              <h3 className="text-green-300 text-xl font-bold mb-3">Features</h3>
              <ul className="space-y-2 text-white/75">
                <li>• <strong>OAuth 2.0</strong> - Secure Google Calendar authentication</li>
                <li>• <strong>Multiple Calendars</strong> - Switch between different calendars</li>
                <li>• <strong>Event Types</strong> - Distinguish between personal and Google events</li>
                <li>• <strong>Real-time Sync</strong> - Automatic event fetching and updates</li>
                <li>• <strong>Custom Styling</strong> - Dark theme with yellow accents</li>
              </ul>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="bg-gradient-to-br from-purple-800/30 to-purple-900/30 border border-purple-300/20 rounded-xl p-6">
            <h3 className="text-purple-300 text-xl font-bold mb-3">How to Use</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-white mb-2">1. Connect Google Calendar</h4>
                <p className="text-white/75">Click "Connect with Google" to authenticate and access your calendars.</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">2. Switch Views</h4>
                <p className="text-white/75">Use the view buttons to switch between different calendar displays.</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">3. Add Personal Events</h4>
                <p className="text-white/75">Create personal events that integrate with your Google Calendar events.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarDemo; 
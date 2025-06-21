'use client';

import React, { useState, useMemo } from 'react';
import { useDrop } from 'react-dnd';
import { Bars4Icon, XCircleIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { useGoogleCalendar } from '../contexts/GoogleCalendarContext';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: string;
  time?: string;
  instructor?: string;
  location?: string;
  isPersonal?: boolean;
  notes?: string;
  isGoogleEvent?: boolean;
}

interface PersonalTimelineProps {
  personalEvents: CalendarEvent[];
  setPersonalEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  combinedEvents?: CalendarEvent[];
  isGCalAuthenticated?: boolean;
  selectedCalendar?: any;
  googleEvents?: any[];
  authenticateGCal?: () => void;
  isGCalLoading?: boolean;
}

export const PersonalTimeline: React.FC<PersonalTimelineProps> = ({
  personalEvents,
  setPersonalEvents,
  combinedEvents = [],
  isGCalAuthenticated = false,
  selectedCalendar = null,
  googleEvents = [],
  authenticateGCal,
  isGCalLoading
}) => {
  // Google Calendar context
  const { 
    isAuthenticated: isGCalContextAuthenticated, 
    selectedCalendar: contextSelectedCalendar,
    createEvent: createGCalEvent,
    fetchCalendarEvents
  } = useGoogleCalendar();

  // Use context values if available, otherwise fall back to props
  const isAuthenticated = isGCalContextAuthenticated || isGCalAuthenticated;
  const selectedCal = contextSelectedCalendar || selectedCalendar;

  const timeSlots = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en', { weekday: 'short' }),
      isToday: i === 0,
    };
  });

  // State for quick add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [tempEvent, setTempEvent] = useState<CalendarEvent>({
    id: '',
    date: '',
    title: '',
    type: 'personal',
    time: '',
    notes: '',
    isPersonal: true,
  });

  const getEventHour = (timeStr: string | undefined) => {
    if (!timeStr || timeStr === 'All Day') return 6;
    const match = timeStr.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
    if (!match) return 6;
    let hour = parseInt(match[1]);
    const meridiem = match[3];
    if (meridiem?.toUpperCase() === 'PM' && hour < 12) hour += 12;
    if (meridiem?.toUpperCase() === 'AM' && hour === 12) hour = 0;
    return hour;
  };

  const formatTimeSlot = (hour: number) => {
    if (hour === 12) return '12:00 PM';
    if (hour > 12) return `${hour - 12}:00 PM`;
    return `${hour}:00 AM`;
  };

  const openCreateModal = (date: string, hour: number) => {
    setTempEvent({
      id: '',
      date,
      title: '',
      type: 'personal',
      time: formatTimeSlot(hour),
      notes: '',
      isPersonal: true,
    });
    setShowAddModal(true);
  };

  const handleAddEvent = () => {
    if (tempEvent.title.trim()) {
      setPersonalEvents((prev) => [
        ...prev,
        { ...tempEvent, id: `personal-${Date.now()}` },
      ]);
      setShowAddModal(false);
      setTempEvent({
        id: '',
        date: '',
        title: '',
        type: 'personal',
        time: '',
        notes: '',
        isPersonal: true,
      });
    }
  };

  // Timeline Event Component
  const TimelineEvent: React.FC<{ event: CalendarEvent }> = ({ event }) => {
    const [{ isDragging }, drag] = useDrop<CalendarEvent, void, { isDragging: boolean }>({
      accept: 'personal-event',
      drop: (item) => {
        if (item.id !== event.id) {
          setPersonalEvents((prev) =>
            prev.map((e) =>
              e.id === item.id
                ? { ...e, date: event.date, time: event.time }
                : e
            )
          );
        }
      },
      collect: (monitor) => ({ isDragging: !!monitor.isOver() }),
    });

    const isGoogleEvent = event.isGoogleEvent;
    const isPersonal = event.isPersonal;

    const addToGoogleCalendar = async (event: CalendarEvent) => {
      // If user is not authenticated with Google Calendar, open the Google Calendar page
      if (!isAuthenticated || !selectedCal) {
        const timeStr = event.time || '';
        let hours = 0;
        let minutes = 0;
        
        const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeMatch) {
          hours = parseInt(timeMatch[1]);
          minutes = parseInt(timeMatch[2]);
          const meridiem = timeMatch[3].toUpperCase();
          
          if (meridiem === 'PM' && hours < 12) hours += 12;
          if (meridiem === 'AM' && hours === 12) hours = 0;
        }
        
        const startDate = new Date(event.date);
        startDate.setHours(hours, minutes, 0, 0);
        
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        
        const params = new URLSearchParams({
          action: 'TEMPLATE',
          text: event.title,
          details: event.notes || 'Personal Event',
          dates: `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          location: 'Personal Event'
        });

        window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
        return;
      }

      // If user is authenticated, use the API to create the event
      try {
        const timeStr = event.time || '';
        let hours = 0;
        let minutes = 0;
        
        const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeMatch) {
          hours = parseInt(timeMatch[1]);
          minutes = parseInt(timeMatch[2]);
          const meridiem = timeMatch[3].toUpperCase();
          
          if (meridiem === 'PM' && hours < 12) hours += 12;
          if (meridiem === 'AM' && hours === 12) hours = 0;
        }
        
        const startDate = new Date(event.date);
        startDate.setHours(hours, minutes, 0, 0);
        
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        
        const result = await createGCalEvent({
          summary: event.title,
          description: event.notes || 'Personal Event',
          startDateTime: startDate.toISOString(),
          endDateTime: endDate.toISOString(),
          location: 'Personal Event'
        });

        if (result.success) {
          // Show success message (you could add a toast notification here)
          console.log('Event added to Google Calendar successfully!');
          // Optionally refresh the events list
          if (fetchCalendarEvents) {
            await fetchCalendarEvents();
          }
        } else {
          console.error('Failed to add event to Google Calendar:', result.error);
          // Fallback to opening Google Calendar page
          const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: event.title,
            details: event.notes || 'Personal Event',
            dates: `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
            location: 'Personal Event'
          });
          window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
        }
      } catch (error) {
        console.error('Error adding event to Google Calendar:', error);
        // Fallback to opening Google Calendar page
        const timeStr = event.time || '';
        let hours = 0;
        let minutes = 0;
        
        const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeMatch) {
          hours = parseInt(timeMatch[1]);
          minutes = parseInt(timeMatch[2]);
          const meridiem = timeMatch[3].toUpperCase();
          
          if (meridiem === 'PM' && hours < 12) hours += 12;
          if (meridiem === 'AM' && hours === 12) hours = 0;
        }
        
        const startDate = new Date(event.date);
        startDate.setHours(hours, minutes, 0, 0);
        
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        
        const params = new URLSearchParams({
          action: 'TEMPLATE',
          text: event.title,
          details: event.notes || 'Personal Event',
          dates: `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          location: 'Personal Event'
        });

        window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
      }
    };

    return (
      <div
        ref={drag as unknown as React.Ref<HTMLDivElement>}
        className={`p-2 rounded-lg text-white text-xs mb-1 transition-all w-full flex items-center backdrop-blur-sm relative overflow-hidden ${isDragging ? 'opacity-50' : 'hover:opacity-90'} max-h-[46px] ${
          isGoogleEvent 
            ? 'bg-gradient-to-br from-green-700/90 to-green-800/90' 
            : isPersonal 
            ? 'bg-gradient-to-br from-blue-700/90 to-blue-800/90'
            : 'bg-gradient-to-br from-slate-700/90 to-slate-800/90'
        }`}
      >
        <div className={`absolute inset-0 pointer-events-none ${
          isGoogleEvent 
            ? 'bg-gradient-to-tr from-green-300/10 via-transparent to-transparent' 
            : isPersonal 
            ? 'bg-gradient-to-tr from-blue-300/10 via-transparent to-transparent'
            : 'bg-gradient-to-tr from-yellow-300/10 via-transparent to-transparent'
        }`} />
        <div
          ref={drag as unknown as React.Ref<HTMLDivElement>}
          className="cursor-move mr-2 flex-shrink-0 relative z-10 w-8 h-8 sm:w-5 sm:h-5 flex items-center justify-center"
        >
          <Bars4Icon className={`w-8 h-8 sm:w-5 sm:h-5 ${isGoogleEvent ? 'text-green-300' : isPersonal ? 'text-blue-300' : 'text-yellow-300'}`} />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden relative z-10">
          <div className="font-semibold truncate max-w-[50px] flex items-center gap-1">
            {isGoogleEvent && <span className="text-green-300 text-[8px]">📅</span>}
            {isPersonal && <span className="text-blue-300 text-[8px]">👤</span>}
            {event.title}
          </div>
          {event.notes && <div className="opacity-80 text-[10px] truncate max-w-[110px]">{event.notes}</div>}
        </div>
        <div className="flex gap-1 flex-shrink-0 ml-2 relative z-10">
          {!isGoogleEvent && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToGoogleCalendar(event);
              }}
              className="px-2 py-1 bg-yellow-300/10 hover:bg-yellow-300/20 rounded text-[10px] font-semibold text-yellow-300 transition-colors border border-yellow-300/20 whitespace-nowrap"
            >
              GCal
            </button>
          )}
          {isPersonal && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPersonalEvents(prev => prev.filter(e => e.id !== event.id));
              }}
              className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 rounded text-[10px] font-semibold text-red-300 transition-colors border border-red-300/20 whitespace-nowrap"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-yellow-300 text-xl font-bold">Personal Timeline</h3>
          <div className="flex gap-2">
            {!isAuthenticated && authenticateGCal && (
              <button
                onClick={authenticateGCal}
                className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 rounded-lg text-green-300 transition-colors border border-green-300/20 flex items-center gap-1"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  />
                </svg>
                Connect GCal
              </button>
            )}
            {isAuthenticated && (
              <div className="px-3 py-1.5 bg-green-600/20 rounded-lg text-green-300 border border-green-300/20 flex items-center gap-1">
                {isGCalLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-300"></div>
                    <span className="text-green-300 text-sm">Loading...</span>
                  </>
                ) : (
                  <span className="text-green-300 text-sm">✓ Connected</span>
                )}
              </div>
            )}
            <button
              onClick={() => openCreateModal(new Date().toISOString().split('T')[0], 9)}
              className="px-3 py-1.5 bg-yellow-300/10 hover:bg-yellow-300/20 rounded-lg text-yellow-300 transition-colors border border-yellow-300/20 flex items-center gap-1"
            >
              <UserPlusIcon className="w-4 h-4" />
              Add Event
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header row with day names */}
            <div className="grid grid-cols-8 gap-2 mb-2">
              <div className="w-16 text-xs text-yellow-300/50 font-medium">Time</div>
              {weekDays.map(day => (
                <div
                  key={day.date}
                  className={`text-center text-sm font-medium p-2 rounded-lg ${
                    day.isToday 
                      ? 'bg-yellow-300/20 text-yellow-300 border border-yellow-300/30' 
                      : 'text-white/75'
                  }`}
                >
                  <div>{day.dayName}</div>
                  <div className="text-xs opacity-75">
                    {new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>

            {/* Time slots */}
            {timeSlots.map(hour => (
              <div key={hour} className="grid grid-cols-8 gap-2 mb-1">
                <div className="w-16 text-xs text-yellow-300/50 flex items-center justify-center">
                  {formatTimeSlot(hour)}
                </div>
                {weekDays.map(day => {
                  const [{ isOver }, drop] = useDrop<CalendarEvent, void, { isOver: boolean }>({
                    accept: 'personal-event',
                    drop: (item) => {
                      setPersonalEvents((prev) =>
                        prev.map((e) =>
                          e.id === item.id
                            ? { ...e, date: day.date, time: formatTimeSlot(hour) }
                            : e
                        )
                      );
                    },
                    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
                  });

                  const dayEvents = combinedEvents.filter(event => 
                    event.date === day.date && getEventHour(event.time) === hour
                  );

                  return (
                    <div
                      key={`${day.date}-${hour}`}
                      ref={drop as unknown as React.Ref<HTMLDivElement>}
                      className={`min-h-[50px] p-1 rounded-lg border-2 transition-all ${
                        isOver 
                          ? 'border-yellow-300/50 bg-yellow-300/10' 
                          : 'border-yellow-300/10 hover:border-yellow-300/20'
                      }`}
                      onClick={() => openCreateModal(day.date, hour)}
                    >
                      {dayEvents.map(event => (
                        <TimelineEvent key={event.id} event={event} />
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Add Event Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setShowAddModal(false)}>
            <div className="bg-slate-800/90 rounded-lg p-4 w-full max-w-[90vw] md:max-w-md border border-yellow-300/20 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-yellow-300 font-semibold">Add Personal Event</h4>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-yellow-300 transition-colors"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-yellow-300/75 mb-1">Title</label>
                  <input
                    type="text"
                    value={tempEvent.title}
                    onChange={(e) => setTempEvent(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-yellow-300/20 rounded-md text-sm text-white focus:outline-none focus:border-yellow-300"
                    placeholder="Event title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-yellow-300/75 mb-1">Time</label>
                  <input
                    type="time"
                    value={tempEvent.time}
                    onChange={(e) => setTempEvent(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-yellow-300/20 rounded-md text-sm text-white focus:outline-none focus:border-yellow-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-yellow-300/75 mb-1">Notes</label>
                  <textarea
                    value={tempEvent.notes}
                    onChange={(e) => setTempEvent(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-yellow-300/20 rounded-md text-sm text-white focus:outline-none focus:border-yellow-300 min-h-[80px] resize-y"
                    placeholder="Add any notes about your event..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-yellow-300/20">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm border border-yellow-300/20 text-yellow-300/75 rounded-md hover:bg-yellow-300/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  className="px-4 py-2 text-sm bg-yellow-300/10 hover:bg-yellow-300/20 text-yellow-300 rounded-md border border-yellow-300/20"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 
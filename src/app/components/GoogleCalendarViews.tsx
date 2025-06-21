'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarStyles.css';
import { useGoogleCalendar } from '../contexts/GoogleCalendarContext';
import { useDrop } from 'react-dnd';
import { Bars4Icon, UserPlusIcon, XCircleIcon } from '@heroicons/react/24/outline';

const localizer = momentLocalizer(moment);

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

interface GoogleCalendarViewsProps {
  personalEvents: CalendarEvent[];
  setPersonalEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  combinedEvents?: CalendarEvent[];
}

// Convert events to react-big-calendar format
const convertToBigCalendarEvents = (events: CalendarEvent[]) => {
  return events.map(event => {
    const startDate = new Date(event.date);
    const endDate = new Date(event.date);
    
    if (event.time && event.time !== 'All Day') {
      const timeMatch = event.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const meridiem = timeMatch[3].toUpperCase();
        
        if (meridiem === 'PM' && hours < 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
        
        startDate.setHours(hours, minutes, 0, 0);
        endDate.setHours(hours + 1, minutes, 0, 0);
      }
    }
    
    return {
      id: event.id,
      title: event.title,
      start: startDate,
      end: endDate,
      resource: event,
      isGoogleEvent: event.isGoogleEvent,
      isPersonal: event.isPersonal,
    };
  });
};

// Custom event component for react-big-calendar
const EventComponent = ({ event }: { event: any }) => {
  const isGoogleEvent = event.isGoogleEvent;
  const isPersonal = event.isPersonal;
  
  return (
    <div className={`p-1 text-xs rounded ${
      isGoogleEvent 
        ? 'bg-green-600 text-white' 
        : isPersonal 
        ? 'bg-blue-600 text-white'
        : 'bg-yellow-600 text-black'
    }`}>
      <div className="font-semibold truncate">{event.title}</div>
      {isGoogleEvent && <div className="text-[10px]">📅 Google</div>}
      {isPersonal && <div className="text-[10px]">👤 Personal</div>}
    </div>
  );
};

export const GoogleCalendarViews: React.FC<GoogleCalendarViewsProps> = ({
  personalEvents,
  setPersonalEvents,
  combinedEvents = []
}) => {
  const { 
    isAuthenticated, 
    selectedCalendar, 
    googleEvents,
    createEvent: createGCalEvent,
    fetchCalendarEvents
  } = useGoogleCalendar();
  const [view, setView] = useState<'big-calendar' | 'personal-grid' | 'google-iframe' | 'timeline'>('timeline');
  const [bigCalendarView, setBigCalendarView] = useState<View>(Views.WEEK);

  // Convert all events to big calendar format
  const bigCalendarEvents = useMemo(() => {
    const allEvents = [...personalEvents, ...combinedEvents];
    return convertToBigCalendarEvents(allEvents);
  }, [personalEvents, combinedEvents]);

  // Timeline view component
  const TimelineView = () => {
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
        if (!isAuthenticated || !selectedCalendar) {
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
      <>
        <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-yellow-300 text-xl font-bold">Timeline View</h3>
            <div className="flex gap-2">
              {isAuthenticated && (
                <button
                  onClick={() => setView('google-iframe')}
                  className="px-3 py-1 bg-green-600/20 hover:bg-green-600/30 border border-green-300/30 rounded-lg text-sm text-green-300 transition-all"
                >
                  Google Calendar
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-8 gap-1 mb-2">
                <div className="w-16"></div>
                {weekDays.map(day => (
                  <div key={day.date} className={`text-center p-2 rounded ${
                    day.isToday ? 'bg-yellow-300/20 text-yellow-300' : 'bg-slate-700/50 text-white'
                  }`}>
                    <div className="text-sm font-semibold">{day.dayName}</div>
                    <div className="text-xs">{new Date(day.date).getDate()}</div>
                  </div>
                ))}
              </div>

              {/* Time slots */}
              {timeSlots.map(hour => (
                <div key={hour} className="grid grid-cols-8 gap-1 mb-1">
                  <div className="w-16 text-xs text-yellow-300/50 p-2 flex items-center">
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
                        className={`min-h-[40px] border border-yellow-300/10 rounded p-1 relative ${
                          isOver ? 'bg-yellow-300/10' : 'bg-transparent'
                        }`}
                        onClick={() => {
                          if (dayEvents.length === 0) {
                            openCreateModal(day.date, hour);
                          }
                        }}
                      >
                        {dayEvents.map(event => (
                          <TimelineEvent key={event.id} event={event} />
                        ))}
                        {dayEvents.length === 0 && (
                          <div className="w-full h-full flex items-center justify-center">
                            <button
                              onClick={() => openCreateModal(day.date, hour)}
                              className="opacity-0 hover:opacity-100 transition-opacity p-1 rounded-full bg-yellow-300/10 hover:bg-yellow-300/20"
                            >
                              <UserPlusIcon className="w-4 h-4 text-yellow-300" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/75 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter event title"
                    className="w-full px-3 py-2 bg-slate-700/50 border border-yellow-300/30 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-300"
                    value={tempEvent.title}
                    onChange={(e) => setTempEvent(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/75 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    placeholder="Add notes..."
                    className="w-full px-3 py-2 bg-slate-700/50 border border-yellow-300/30 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-300"
                    rows={3}
                    value={tempEvent.notes}
                    onChange={(e) => setTempEvent(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-yellow-300/30">
                  <button
                    className="px-4 py-2 text-white/75 hover:text-yellow-300 rounded-lg text-sm border border-yellow-300/20"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-yellow-300 text-blue-950 rounded-lg text-sm font-semibold transition-all hover:bg-yellow-400"
                    onClick={handleAddEvent}
                  >
                    Add Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Big Calendar view
  const BigCalendarView = () => (
    <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-yellow-300 text-xl font-bold">Big Calendar View</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setBigCalendarView(Views.MONTH)}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${
              bigCalendarView === Views.MONTH 
                ? 'bg-yellow-300 text-black' 
                : 'bg-yellow-300/10 text-yellow-300 border border-yellow-300/30'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setBigCalendarView(Views.WEEK)}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${
              bigCalendarView === Views.WEEK 
                ? 'bg-yellow-300 text-black' 
                : 'bg-yellow-300/10 text-yellow-300 border border-yellow-300/30'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setBigCalendarView(Views.DAY)}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${
              bigCalendarView === Views.DAY 
                ? 'bg-yellow-300 text-black' 
                : 'bg-yellow-300/10 text-yellow-300 border border-yellow-300/30'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setView('timeline')}
            className="px-3 py-1 bg-yellow-300/10 hover:bg-yellow-300/20 border border-yellow-300/30 rounded-lg text-sm text-yellow-300 transition-all"
          >
            Timeline
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4">
        <Calendar
          localizer={localizer}
          events={bigCalendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          view={bigCalendarView}
          onView={setBigCalendarView}
          getNow={() => new Date(0)}
          components={{
            event: EventComponent
          }}
          eventPropGetter={(event) => ({
            className: event.isGoogleEvent ? 'google-event' : event.isPersonal ? 'personal-event' : 'rsf-event'
          })}
        />
      </div>
    </div>
  );

  // Google Calendar iframe view
  const GoogleIframeView = () => {
    if (!isAuthenticated || !selectedCalendar) {
      return (
        <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="text-center text-yellow-300">
            <h3 className="text-xl font-bold mb-4">Google Calendar Not Connected</h3>
            <p className="text-white/75">Connect your Google Calendar to view it here.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-yellow-300 text-xl font-bold">Google Calendar</h3>
          <div className="flex gap-2">

            <button
              onClick={() => setView('timeline')}
              className="px-3 py-1 bg-yellow-300/10 hover:bg-yellow-300/20 border border-yellow-300/30 rounded-lg text-sm text-yellow-300 transition-all"
            >
              Timeline
            </button>
          </div>
        </div>
        <iframe
          src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(selectedCalendar.id)}&ctz=America%2FLos_Angeles`}
          className="w-full h-[600px] rounded-lg border-0"
        />
      </div>
    );
  };

  // Main view selector
  return (
    <div className="space-y-6">
      {view === 'big-calendar' && <BigCalendarView />}
      {view === 'timeline' && <TimelineView />}
      {view === 'google-iframe' && <GoogleIframeView />}
      
      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-yellow-300/20 rounded-xl p-4">
          <div className="text-yellow-300 text-2xl font-bold">{personalEvents.length}</div>
          <div className="text-white/75 text-sm">Personal Events</div>
        </div>
        <div className="bg-gradient-to-br from-green-800/50 to-green-900/50 border border-green-300/20 rounded-xl p-4">
          <div className="text-green-300 text-2xl font-bold">{googleEvents.length}</div>
          <div className="text-white/75 text-sm">Google Events</div>
        </div>
        <div className="bg-gradient-to-br from-blue-800/50 to-blue-900/50 border border-blue-300/20 rounded-xl p-4">
          <div className="text-blue-300 text-2xl font-bold">{combinedEvents.length}</div>
          <div className="text-white/75 text-sm">Total Events</div>
        </div>
        <div className="bg-gradient-to-br from-purple-800/50 to-purple-900/50 border border-purple-300/20 rounded-xl p-4">
          <div className="text-purple-300 text-2xl font-bold">{isAuthenticated ? 'Connected' : 'Disconnected'}</div>
          <div className="text-white/75 text-sm">Google Calendar</div>
        </div>
      </div>
    </div>
  );
}; 
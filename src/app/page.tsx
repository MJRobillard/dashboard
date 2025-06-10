"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Chart,
  TooltipItem
} from 'chart.js';
import { DndProvider } from 'react-dnd';
import { useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import useEmblaCarousel from 'embla-carousel-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface WorkoutData {
  date: string;
  completed: boolean;
  type: string;
  weight?: number;
}

interface WorkoutProgress {
  arms: number;
  legs: number;
  back: number;
  core: number;
  chest: number;
  flexibility: number;
}

interface WeightProgress {
  current: number;
  goal: number;
  history: { date: string; weight: number }[];
}

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  type: string;
  time?: string;
  instructor?: string;
  location?: string;
  isPersonal?: boolean;
}

interface CalendarDayType {
  date: string;
  events: CalendarEvent[];
  dayName: string;
  isToday: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}

interface GymFriend {
  id: string;
  name: string;
  email: string;
  avatar: string;
  lastWorkout?: string;
  nextWorkout?: string;
  workoutCount: number;
  isOnline: boolean;
}

// Global configuration
const MOBILE_CARD_WIDTH = '70vw'; // Adjust this value to change mobile card width
const DESKTOP_CARD_WIDTH = '300px'; // Adjust this value to change desktop card width

const CalendarCarousel: React.FC<{
  children: React.ReactNode;
  title: string;
  subtitle: string;
}> = ({ children, title, subtitle }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md transition-all hover:translate-y-[-2px] hover:shadow-lg mb-8">
      <h3 className="text-[#003262] mb-4 text-xl font-semibold">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3">
          {children}
        </div>
      </div>
      <div className="flex justify-center gap-1 mt-4">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index === selectedIndex ? 'bg-[#003262] w-4' : 'bg-gray-300'
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

const FitnessDashboard: React.FC = () => {
  const [workoutData, setWorkoutData] = useState<WorkoutData[]>([]);
  const [rsfActivities, setRsfActivities] = useState<CalendarEvent[]>([]);
  const [personalEvents, setPersonalEvents] = useState<CalendarEvent[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [googleCalendarID, setGoogleCalendarID] = useState('');
  const [ready, setReady] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  const [showGCalInput, setShowGCalInput] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [selectedMeter, setSelectedMeter] = useState<'RSF' | 'CMS'>('RSF');
  const [isLoading, setIsLoading] = useState(true);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [gymFriends, setGymFriends] = useState<GymFriend[]>([
    {
      id: '1',
      name: 'Oski Bear',
      email: 'oski@berkeley.edu',
      avatar: '🐻',
      lastWorkout: 'Yesterday',
      nextWorkout: 'Today at 3 PM',
      workoutCount: 42,
      isOnline: true
    },
    {
      id: '2',
      name: 'Golden Bear',
      email: 'golden@berkeley.edu',
      avatar: '💪',
      lastWorkout: '2 days ago',
      nextWorkout: 'Tomorrow at 10 AM',
      workoutCount: 35,
      isOnline: false
    },
    {
      id: '3',
      name: 'Cal Spirit',
      email: 'spirit@berkeley.edu',
      avatar: '🏃',
      lastWorkout: 'Today',
      nextWorkout: 'Thursday at 2 PM',
      workoutCount: 28,
      isOnline: true
    }
  ]);

  const [searchFriends, setSearchFriends] = useState('');
  const [selectedWorkoutType, setSelectedWorkoutType] = useState('');

  const [workoutProgress, setWorkoutProgress] = useState<WorkoutProgress>({
    arms: 30,
    legs: 40,
    back: 25,
    core: 35,
    chest: 45,
    flexibility: 20
  });

  const [timeScale, setTimeScale] = useState<'7d' | '14d' | '30d'>('7d');

  const [weightProgress, setWeightProgress] = useState<WeightProgress>({
    current: 150,
    goal: 160,
    history: [
      { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], weight: 145 },
      { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], weight: 147 },
      { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], weight: 148 },
      { date: new Date().toISOString().split('T')[0], weight: 150 }
    ]
  });
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState<string>('');
  const [newWeightGoal, setNewWeightGoal] = useState<string>('');
  const weightModalRef = useRef<HTMLDivElement>(null);

  const berkeleyBlue = '#003262';
  const calGold = '#FDB515';
  const offGrey = '#f5f5f5';
  const darkGrey = '#333333';

  const fetchClassData = async (date: string): Promise<CalendarEvent[]> => {
    try {
      const response = await fetch(`https://widgets.mindbodyonline.com/widgets/schedules/3262/load_markup?options[start_date]=${date}`, {
        mode: 'cors'
      });
      const text = await response.text();
      const data = JSON.parse(text);
      const classSessionsHtml = data.class_sessions;
      const parser = new DOMParser();
      const doc = parser.parseFromString(classSessionsHtml, 'text/html');
      const sessions = doc.querySelectorAll('.bw-session');
      const events: CalendarEvent[] = [];
      sessions.forEach((session, index) => {
        const nameElement = session.querySelector('.bw-session__name');
        const timeElement = session.querySelector('.hc_starttime');
        const instructorElement = session.querySelector('.bw-session__staff');
        const typeElement = session.querySelector('.bw-session__type');
        
        if (nameElement && timeElement) {
          const className = nameElement.textContent?.trim() || 'Class';
          const time = timeElement.textContent?.trim() || '';
          const instructor = instructorElement?.textContent?.trim() || '';
          const type = typeElement?.textContent?.replace(' - ', '').trim() || 'Fitness';
          
          events.push({
            id: `rsf-${date}-${index}`,
            date: date,
            title: className,
            type: type,
            time: time,
            instructor: instructor,
            isPersonal: false
          });
        }
      });
      
      return events;
    } catch (error) {
      console.error('Error fetching class data:', error);
      return [];
    }
  };

  useEffect(() => {
    const workoutTypes = ['arms', 'legs', 'back', 'core', 'chest', 'flexibility'];
    const mockWorkouts: WorkoutData[] = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        completed: Math.random() > 0.3,
        type: workoutTypes[Math.floor(Math.random() * workoutTypes.length)]
      };
    });
    setWorkoutData(mockWorkouts);

    const fetchWeeklyClasses = async () => {
      setIsLoading(true);
      const allEvents: CalendarEvent[] = [];
      const today = new Date();
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayEvents = await fetchClassData(dateStr);
        allEvents.push(...dayEvents);
      }
      
      setRsfActivities(allEvents);
      setIsLoading(false);
    };

    fetchWeeklyClasses();
  }, []);

  useEffect(() => {
    const completionRate = workoutData.filter(w => w.completed).length / workoutData.length;
    if (completionRate > 0.8) {
      setMotivationalMessage("🐻 GO BEARS! You're crushing it! Keep up the amazing work!");
    } else if (completionRate > 0.6) {
      setMotivationalMessage("💪 Strong progress, Golden Bear! Push for excellence!");
    } else {
      setMotivationalMessage("🌟 Every journey starts with a single step. Let's go, Bear!");
    }
  }, [workoutData]);

  const achievements: Achievement[] = [
    { id: '1', title: 'First Workout', description: 'Complete your first workout', icon: '🏃', unlocked: true, unlockedDate: '2024-01-15' },
    { id: '2', title: 'Week Warrior', description: '7 consecutive days', icon: '🔥', unlocked: true, unlockedDate: '2024-01-22' },
    { id: '4', title: 'Cal Champion', description: '30 day streak', icon: '🏆', unlocked: false }
  ];

  const getTimeScaleDays = () => {
    switch (timeScale) {
      case '14d': return 14;
      case '30d': return 30;
      default: return 7;
    }
  };

  const calculateWorkoutStats = (type: string, days: number) => {
    const data = workoutData
      .filter(w => w.completed && w.type === type)
      .slice(-days);
    
    const total = data.length;
    const streak = data.reduce((acc, curr, i) => {
      if (i === 0) return curr.completed ? 1 : 0;
      const prevDate = new Date(data[i-1].date);
      const currDate = new Date(curr.date);
      const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);
      return dayDiff === 1 ? acc + 1 : 0;
    }, 0);
    
    const weekly = total / (days / 7);
    
    return { total, streak, weekly };
  };

  const consistencyChartData = {
    labels: workoutData.slice(-getTimeScaleDays()).map(w => new Date(w.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Arms',
        data: Array.from({ length: getTimeScaleDays() }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (getTimeScaleDays() - 1 - i));
          const dateStr = date.toISOString().split('T')[0];
          return workoutData
            .filter(w => w.date <= dateStr && w.type === 'arms' && w.completed)
            .length;
        }),
        borderColor: berkeleyBlue,
        backgroundColor: `${berkeleyBlue}33`,
        tension: 0.4
      },
      {
        label: 'Legs',
        data: Array.from({ length: getTimeScaleDays() }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (getTimeScaleDays() - 1 - i));
          const dateStr = date.toISOString().split('T')[0];
          return workoutData
            .filter(w => w.date <= dateStr && w.type === 'legs' && w.completed)
            .length;
        }),
        borderColor: calGold,
        backgroundColor: `${calGold}33`,
        tension: 0.4
      },
      {
        label: 'Back',
        data: Array.from({ length: getTimeScaleDays() }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (getTimeScaleDays() - 1 - i));
          const dateStr = date.toISOString().split('T')[0];
          return workoutData
            .filter(w => w.date <= dateStr && w.type === 'back' && w.completed)
            .length;
        }),
        borderColor: '#666666',
        backgroundColor: '#66666633',
        tension: 0.4
      },
      {
        label: 'Core',
        data: Array.from({ length: getTimeScaleDays() }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (getTimeScaleDays() - 1 - i));
          const dateStr = date.toISOString().split('T')[0];
          return workoutData
            .filter(w => w.date <= dateStr && w.type === 'core' && w.completed)
            .length;
        }),
        borderColor: '#2E8B57',
        backgroundColor: '#2E8B5733',
        tension: 0.4
      },
      {
        label: 'Chest',
        data: Array.from({ length: getTimeScaleDays() }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (getTimeScaleDays() - 1 - i));
          const dateStr = date.toISOString().split('T')[0];
          return workoutData
            .filter(w => w.date <= dateStr && w.type === 'chest' && w.completed)
            .length;
        }),
        borderColor: '#4B0082',
        backgroundColor: '#4B008233',
        tension: 0.4
      },
      {
        label: 'Flexibility',
        data: Array.from({ length: getTimeScaleDays() }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (getTimeScaleDays() - 1 - i));
          const dateStr = date.toISOString().split('T')[0];
          return workoutData
            .filter(w => w.date <= dateStr && w.type === 'flexibility' && w.completed)
            .length;
        }),
        borderColor: '#FF6B6B',
        backgroundColor: '#FF6B6B33',
        tension: 0.4
      }
    ]
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        },
        title: {
          display: true,
          text: 'Workouts Completed'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const workoutTypeData = {
    labels: ['Arms', 'Legs', 'Back', 'Core', 'Chest', 'Flexibility'],
    datasets: [{
      data: workoutData
        .filter(w => w.completed)
        .reduce((acc, workout) => {
          const index = ['arms', 'legs', 'back', 'core', 'chest', 'flexibility'].indexOf(workout.type);
          if (index !== -1) acc[index]++;
          return acc;
        }, [0, 0, 0, 0, 0, 0]),
      backgroundColor: [
        '#003262',
        '#FDB515',
        '#666666',
        '#2E8B57',
        '#4B0082',
        '#FF6B6B'
      ],
      borderWidth: 0
    }]
  };

  const generatePersonalCalendarDays = () => {
    const days: { date: string; events: CalendarEvent[] }[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        events: personalEvents.filter(e => e.date === dateStr)
      });
    }
    return days;
  };

  const CalendarDay: React.FC<{ 
    date: string; 
    events: CalendarEvent[]; 
    dayName: string; 
    isToday: boolean; 
  }> = ({ date, events, dayName, isToday }) => {
    const [{ isOver }, drop] = useDrop<CalendarEvent, void, { isOver: boolean }>({
      accept: 'event',
      drop: (item: CalendarEvent) => {
        setCalendarEvents(prev => prev.map(e => 
          e.id === item.id ? { ...e, date } : e
        ));
      },
      collect: monitor => ({
        isOver: !!monitor.isOver()
      })
    });

    return (
      <div
        ref={drop as unknown as React.LegacyRef<HTMLDivElement>}
        className={`min-h-[120px] ${
          isOver ? 'bg-[#FDB51522]' : 'bg-white'
        } border-2 ${
          isToday ? 'border-[#003262]' : isOver ? 'border-[#FDB515]' : 'border-gray-200'
        } rounded-xl p-3 transition-all w-[${MOBILE_CARD_WIDTH}] md:w-full flex-shrink-0`}
      >
        <div style={{ 
          fontSize: '12px', 
          fontWeight: 'bold', 
          marginBottom: '8px',
          color: isToday ? berkeleyBlue : '#333',
          textAlign: 'center'
        }}>
          <div>{dayName}</div>
          <div style={{ fontSize: '16px', marginTop: '2px' }}>
            {new Date(date).getDate()}
          </div>
        </div>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {events.length > 0 ? (
            events.map(event => (
              <DraggableEvent key={event.id} event={event} />
            ))
          ) : (
            <div style={{ 
              fontSize: '10px', 
              color: '#999', 
              textAlign: 'center',
              padding: '8px 0'
            }}>
              No classes
            </div>
          )}
        </div>
      </div>
    );
  };
  const PersonalCalendarDay: React.FC<{ date: string; events: CalendarEvent[] }> = ({ date, events }) => {
    const [{ isOver }, drop] = useDrop<CalendarEvent, void, { isOver: boolean }>({
      accept: 'personal-event',
      drop: (item: CalendarEvent) => {
        if (item.isPersonal) {
          setPersonalEvents(prev => prev.map(e => 
            e.id === item.id ? { ...e, date } : e
          ));
        }
      },
      collect: monitor => ({
        isOver: !!monitor.isOver()
      })
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [newEvent, setNewEvent] = useState<CalendarEvent>({
      id: '',
      date,
      title: '',
      type: 'strength',
      time: '',
      location: '',
      isPersonal: true
    });

    const handleAddEvent = () => {
      setPersonalEvents(prev => [...prev, newEvent]);
      setShowAddModal(false);
    };

    return (
      <div
        ref={drop as unknown as React.LegacyRef<HTMLDivElement>}
        className={`min-h-[400px] bg-white border rounded-lg p-4 transition-all w-[${MOBILE_CARD_WIDTH}] md:w-full flex-shrink-0 ${
          isOver ? 'border-[#FDB515] bg-[#FDB51510]' : 'border-gray-200'
        }`}
        onClick={() => setShowAddModal(true)}
      >
        <div className="text-sm font-semibold mb-3">{new Date(date).getDate()}</div>
        <div className="space-y-2">
          {events.map(event => (
            <PersonalEvent key={event.id} event={event} />
          ))}
        </div>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-lg p-4 w-full max-w-[90vw] md:max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Personal Workout</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder="Workout title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={e => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={e => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder="Workout location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newEvent.type}
                    onChange={e => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="strength">Strength</option>
                    <option value="cardio">Cardio</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEvent}
                    className="px-3 py-1.5 text-sm bg-[#FDB515] text-white rounded-md hover:bg-[#FDB515]/90"
                  >
                    Add Workout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const DraggableEvent: React.FC<{ event: CalendarEvent }> = ({ event }) => {
    const getTypeColor = (type: string) => {
      switch (type.toUpperCase()) {
        case 'CARDIO': return '#FDB515';
        case 'STRENGTH': return '#003262';
        case 'MIND/BODY': return '#666666';
        case 'DANCE': return '#e74c3c';
        default: return '#003262';
      }
    };

    return (
      <div
        className="p-3 rounded-lg text-white text-sm mb-2 transition-all hover:opacity-90 w-full"
        style={{ backgroundColor: getTypeColor(event.type) }}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div className="flex-1">
            <div className="font-semibold mb-1">{event.title}</div>
            {event.time && <div className="opacity-90 text-xs">{event.time}</div>}
            {event.instructor && <div className="opacity-80 text-xs">{event.instructor}</div>}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToGoogleCalendar(event);
              }}
              className="flex-1 sm:flex-none px-3 py-1.5 bg-white rounded text-xs font-semibold text-[#4285f4] transition-colors hover:bg-gray-100"
            >
              GCal
            </button>
            {event.isPersonal && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPersonalEvents(prev => prev.filter(e => e.id !== event.id));
                }}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-white rounded text-xs font-semibold text-red-500 transition-colors hover:bg-gray-100"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const PersonalEvent: React.FC<{ event: CalendarEvent }> = ({ event }) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'personal-event',
      item: event,
      canDrag: event.isPersonal,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    });

    const getTypeColor = (type: string) => {
      switch (type.toUpperCase()) {
        case 'CARDIO': return '#FDB515';
        case 'STRENGTH': return '#003262';
        case 'MIND/BODY': return '#666666';
        case 'DANCE': return '#e74c3c';
        default: return '#003262';
      }
    };

    const addToGoogleCalendar = (event: CalendarEvent) => {
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
        details: `Class Type: ${event.type}\nInstructor: ${event.instructor}\nLocation: RSF Berkeley`,
        dates: `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        location: '2301 Bancroft Way, Berkeley, CA 94720'
      });

      window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
    };

    return (
      <div
        ref={event.isPersonal ? (drag as unknown as React.LegacyRef<HTMLDivElement>) : undefined}
        className={`p-3 rounded-lg text-white text-sm mb-2 transition-all w-full ${
          isDragging ? 'opacity-50' : 'hover:opacity-90'
        } ${event.isPersonal ? 'cursor-move' : ''}`}
        style={{ backgroundColor: getTypeColor(event.type) }}
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div className="flex-1">
            <div className="font-semibold mb-1">{event.title}</div>
            {event.time && <div className="opacity-90 text-xs">{event.time}</div>}
            {event.instructor && <div className="opacity-80 text-xs">{event.instructor}</div>}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToGoogleCalendar(event);
              }}
              className="flex-1 sm:flex-none px-3 py-1.5 bg-white rounded text-xs font-semibold text-[#4285f4] transition-colors hover:bg-gray-100"
            >
              GCal
            </button>
            {event.isPersonal && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPersonalEvents(prev => prev.filter(e => e.id !== event.id));
                }}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-white rounded text-xs font-semibold text-red-500 transition-colors hover:bg-gray-100"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const generateCalendarDays = (): CalendarDayType[] => {
    const days: CalendarDayType[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        events: rsfActivities.filter(e => e.date === dateStr),
        dayName: date.toLocaleDateString('en', { weekday: 'short' }),
        isToday: i === 0
      });
    }
    return days;
  };

  const styles = ``;

  // Filter friends based on search
  const filteredFriends = useMemo(() => {
    return gymFriends.filter(friend => 
      friend.name.toLowerCase().includes(searchFriends.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchFriends.toLowerCase())
    );
  }, [gymFriends, searchFriends]);

  const updateProgress = (type: string) => {
    setWorkoutProgress(prev => ({
      ...prev,
      [type]: Math.min(prev[type as keyof WorkoutProgress] + 10, 100)
    }));

    const newWorkout: WorkoutData = {
      date: new Date().toISOString().split('T')[0],
      completed: true,
      type: type
    };
    
    setWorkoutData(prev => [...prev.slice(-29), newWorkout]);
    
    const workoutCount = workoutData.filter(w => w.completed && w.type === type).length + 1;
    
    if (workoutCount >= 10) {
      const achievementTitle = `${type.charAt(0).toUpperCase() + type.slice(1)} Master`;
    }
  };

  const goalModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (goalModalRef.current && !goalModalRef.current.contains(event.target as Node)) {
        setShowGoalModal(false);
      }
    };

    if (showGoalModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGoalModal]);

  const updateWeight = () => {
    if (newWeight) {
      const weight = parseFloat(newWeight);
      setWeightProgress(prev => ({
        ...prev,
        current: weight,
        history: [...prev.history, { date: new Date().toISOString().split('T')[0], weight }]
      }));
    }
    if (newWeightGoal) {
      setWeightProgress(prev => ({
        ...prev,
        goal: parseFloat(newWeightGoal)
      }));
    }
    setNewWeight('');
    setNewWeightGoal('');
    setShowWeightModal(false);
  };

  const weightChartData = {
    labels: weightProgress.history.map(h => new Date(h.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Weight Progress',
        data: weightProgress.history.map(h => h.weight),
        borderColor: '#003262',
        backgroundColor: '#00326233',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Goal',
        data: weightProgress.history.map(() => weightProgress.goal),
        borderColor: '#FDB515',
        borderDash: [5, 5],
        tension: 0,
        fill: false
      }
    ]
  };

  const weightChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Weight (lbs)'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <style>{styles}</style>
      <div className="font-inter bg-[#f5f5f5] min-h-screen p-8 text-[#333333]">
        <div className="flex items-center justify-between mb-8 bg-white p-6 md:p-8 rounded-2xl shadow-md">
          <div className="flex items-center gap-4">
            <span className="text-5xl animate-bounce">🐻</span>
            <div>
              <h1 className="m-0 text-[#003262] text-3xl font-bold">
                Fitness Tracker
              </h1>
              <p className="mt-1 text-gray-600 text-base">
              Track your fitness journey
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Today's Date</div>
            <div className="text-2xl font-semibold text-[#003262]">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#003262] to-[#FDB515] text-white p-5 md:p-8 rounded-xl text-center text-lg font-semibold my-6 shadow-lg">
          {motivationalMessage}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md transition-all hover:translate-y-[-2px] hover:shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#003262] m-0">Workout Progress</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeScale('7d')}
                  className={`px-2 py-1 rounded text-xs cursor-pointer ${
                    timeScale === '7d' ? 'bg-[#003262] text-white' : 'bg-[#f5f5f5] text-gray-600'
                  }`}
                >
                  7D
                </button>
                <button
                  onClick={() => setTimeScale('14d')}
                  className={`px-2 py-1 rounded text-xs cursor-pointer ${
                    timeScale === '14d' ? 'bg-[#003262] text-white' : 'bg-[#f5f5f5] text-gray-600'
                  }`}
                >
                  14D
                </button>
                <button
                  onClick={() => setTimeScale('30d')}
                  className={`px-2 py-1 rounded text-xs cursor-pointer ${
                    timeScale === '30d' ? 'bg-[#003262] text-white' : 'bg-[#f5f5f5] text-gray-600'
                  }`}
                >
                  30D
                </button>
              </div>
            </div>
            <div className="flex gap-2 mb-4 overflow-x-auto p-1">
              {['arms', 'legs', 'back', 'core', 'chest', 'flexibility'].map(type => {
                const stats = calculateWorkoutStats(type, getTimeScaleDays());
                const color = type === 'arms' ? '#003262' :
                             type === 'legs' ? '#FDB515' :
                             type === 'back' ? '#666666' :
                             type === 'core' ? '#2E8B57' :
                             type === 'chest' ? '#4B0082' :
                             '#FF6B6B';
                return (
                  <div 
                    key={type}
                    className="p-3 border-l-[3px] bg-gray-50 rounded min-w-fit"
                    style={{ borderLeftColor: color }}
                  >
                    <div className="capitalize font-semibold text-sm" style={{ color }}>
                      {type}
                    </div>
                    <div className="text-xs text-gray-600 flex gap-3 mt-1">
                      <span>{stats.total} total</span>
                      <span>•</span>
                      <span>{stats.streak}d streak</span>
                      <span>•</span>
                      <span>{stats.weekly.toFixed(1)}/wk</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="h-[300px]">
              <Line data={consistencyChartData} options={lineChartOptions} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md transition-all hover:translate-y-[-2px] hover:shadow-lg">
            <h3 className="text-[#003262] mb-4 text-xl font-semibold">Gym Friends</h3>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Search friends..."
                  className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl text-sm transition-all focus:border-[#003262] focus:outline-none"
                  value={searchFriends}
                  onChange={(e) => setSearchFriends(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-3 max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#003262] scrollbar-track-gray-100 scrollbar-thumb-rounded scrollbar-track-rounded">
                {filteredFriends.map(friend => (
                  <div key={friend.id} className="flex items-center p-4 rounded-xl bg-gray-50 transition-all border border-transparent hover:border-[#FDB515] hover:translate-x-1">
                    <div className="text-2xl w-12 h-12 flex items-center justify-center bg-white rounded-full mr-4 border-2 border-[#00326222]">
                      {friend.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-semibold text-base">{friend.name}</span>
                        <div 
                          className={`w-2 h-2 rounded-full ml-2 ${
                            friend.isOnline ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span>🏋️ {friend.workoutCount} workouts</span>
                        {friend.lastWorkout && <span>Last: {friend.lastWorkout}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-2">
                <input
                  type="email"
                  placeholder="Add friend by email"
                  className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl text-sm transition-all focus:border-[#003262] focus:outline-none"
                  value={newFriendEmail}
                  onChange={(e) => setNewFriendEmail(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newFriendEmail) {
                      setGymFriends(prev => [...prev, {
                        id: Date.now().toString(),
                        name: newFriendEmail.split('@')[0],
                        email: newFriendEmail,
                        avatar: '🏋️',
                        workoutCount: 0,
                        isOnline: false
                      }]);
                      setNewFriendEmail('');
                    }
                  }}
                />
                <button
                  className="px-6 py-3 bg-[#003262] text-white rounded-xl text-sm font-semibold transition-all hover:bg-[#002142] disabled:opacity-50"
                  onClick={() => {
                    if (newFriendEmail) {
                      setGymFriends(prev => [...prev, {
                        id: Date.now().toString(),
                        name: newFriendEmail.split('@')[0],
                        email: newFriendEmail,
                        avatar: '🏋️',
                        workoutCount: 0,
                        isOnline: false
                      }]);
                      setNewFriendEmail('');
                    }
                  }}
                  disabled={!newFriendEmail}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md transition-all hover:translate-y-[-2px] hover:shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[#003262] m-0">Achievements</h3>
              <div className="flex gap-2 items-center">
                <select
                  value={selectedWorkoutType}
                  className="p-2 border-2 border-[#f5f5f5] rounded-lg text-sm"
                  onChange={(e) => setSelectedWorkoutType(e.target.value)}
                >
                  <option value="">Log workout...</option>
                  <option value="arms">Arms</option>
                  <option value="legs">Legs</option>
                  <option value="back">Back</option>
                  <option value="core">Core</option>
                  <option value="chest">Chest</option>
                  <option value="flexibility">Flexibility</option>
                </select>
                <button
                  className={`px-4 py-2 bg-[#003262] text-white border-none rounded-lg text-sm font-medium cursor-pointer ${
                    !selectedWorkoutType ? 'opacity-70' : ''
                  }`}
                  disabled={!selectedWorkoutType}
                  onClick={() => {
                    if (selectedWorkoutType) {
                      updateProgress(selectedWorkoutType);
                      setSelectedWorkoutType('');
                    }
                  }}
                >
                  Log
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`inline-flex items-center rounded-lg p-3 transition-all ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-br from-[#00326222] to-[#FDB51522] border border-[#FDB515]' 
                      : 'bg-[#f5f5f5] opacity-50'
                  }`}
                >
                  <span className="text-2xl mr-2">{achievement.icon}</span>
                  <div>
                    <div className="font-semibold text-sm">{achievement.title}</div>
                    <div className="text-xs text-gray-600">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md transition-all hover:translate-y-[-2px] hover:shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#003262] m-0">{selectedMeter} Crowd Meter</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedMeter('RSF')}
                  className={`px-4 py-2 border-none rounded-lg text-sm font-medium cursor-pointer transition-all ${
                    selectedMeter === 'RSF' 
                      ? 'bg-[#003262] text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  RSF
                </button>
                <button
                  onClick={() => setSelectedMeter('CMS')}
                  className={`px-4 py-2 border-none rounded-lg text-sm font-medium cursor-pointer transition-all ${
                    selectedMeter === 'CMS' 
                      ? 'bg-[#003262] text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  CMS
                </button>
              </div>
            </div>
            <div className="relative w-full h-[400px] overflow-hidden rounded-lg bg-gray-50">
              <iframe 
                key={selectedMeter}
                src={selectedMeter === 'RSF' 
                  ? "https://safe.density.io/#/displays/dsp_956223069054042646?token=shr_o69HxjQ0BYrY2FPD9HxdirhJYcFDCeRolEd744Uj88e"
                  : "https://safe.density.io/#/displays/dsp_1160333760881754703?token=shr_CPp9qbE0jN351cCEQmtDr4R90r3SIjZASSY8GU5O3gR"
                }
                className="absolute inset-0 w-full h-full border-0 rounded-lg"
                frameBorder="0"
                scrolling="no"
                title={`${selectedMeter} Crowd Meter`}
              />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md transition-all hover:translate-y-[-2px] hover:shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#003262] text-xl font-semibold">Goals</h3>
              <button
                onClick={() => setShowGoalModal(true)}
                className="px-4 py-2 bg-[#003262] text-white rounded-lg text-sm font-semibold hover:bg-[#002142]"
              >
                Adjust Goals
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {Object.entries(workoutProgress).map(([type, progress]) => {
                const color = type === 'arms' ? '#003262' :
                             type === 'legs' ? '#FDB515' :
                             type === 'back' ? '#666666' :
                             type === 'core' ? '#2E8B57' :
                             type === 'chest' ? '#4B0082' :
                             '#FF6B6B';
                const workoutCount = workoutData.filter(w => w.completed && w.type === type).length;
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className="w-24 capitalize" style={{ color }}>{type}</div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{workoutCount} workouts completed</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-500 ease-out rounded-full"
                          style={{ 
                            width: `${progress}%`,
                            backgroundColor: color
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {showGoalModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                <div ref={goalModalRef} className="bg-white rounded-2xl p-8 w-[480px] shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xl font-semibold text-[#003262]">Adjust Workout Goals</h4>
                    <button
                      onClick={() => setShowGoalModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-6">
                    {Object.entries(workoutProgress).map(([type, progress]) => {
                      const color = type === 'arms' ? '#003262' :
                                   type === 'legs' ? '#FDB515' :
                                   type === 'back' ? '#666666' :
                                   type === 'core' ? '#2E8B57' :
                                   type === 'chest' ? '#4B0082' :
                                   '#FF6B6B';
                      return (
                        <div key={type}>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700 capitalize">
                              {type}
                            </label>
                            <span className="text-sm font-medium" style={{ color }}>
                              {progress}%
                            </span>
                          </div>
                          <div className="relative">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={progress}
                              onChange={(e) => {
                                setWorkoutProgress(prev => ({
                                  ...prev,
                                  [type]: parseInt(e.target.value)
                                }));
                              }}
                              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                              style={{
                                backgroundImage: `linear-gradient(to right, ${color} 0%, ${color} ${progress}%, #f3f4f6 ${progress}%, #f3f4f6 100%)`
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                    <button
                      className="px-6 py-3 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors"
                      onClick={() => setShowGoalModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-6 py-3 bg-[#003262] text-white rounded-xl text-sm font-semibold transition-all hover:bg-[#002142]"
                      onClick={() => setShowGoalModal(false)}
                    >
                      Save Goals
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md transition-all hover:translate-y-[-2px] hover:shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#003262] text-xl font-semibold">Weight Data</h3>
              <button
                onClick={() => setShowWeightModal(true)}
                className="px-4 py-2 bg-[#003262] text-white rounded-lg text-sm font-semibold hover:bg-[#002142]"
              >
                Update Weight
              </button>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-600">Current Weight</div>
                <div className="text-2xl font-semibold">{weightProgress.current} lbs</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Goal Weight</div>
                <div className="text-2xl font-semibold text-[#FDB515]">{weightProgress.goal} lbs</div>
              </div>
            </div>
            <div className="h-[300px]">
              <Line data={weightChartData} options={weightChartOptions} />
            </div>
          </div>
        </div>

        <CalendarCarousel 
          title="RSF Activities Calendar"
          subtitle="Click 'Add' to add activities to your personal calendar"
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-[200px] text-[#003262] text-sm font-medium">
              Loading RSF activities...
            </div>
          ) : (
            generateCalendarDays().map(day => (
              <div key={day.date} className={`min-w-[${MOBILE_CARD_WIDTH}] md:min-w-[${DESKTOP_CARD_WIDTH}]`}>
                <CalendarDay 
                  date={day.date} 
                  events={day.events}
                  dayName={day.dayName}
                  isToday={day.isToday}
                />
              </div>
            ))
          )}
        </CalendarCarousel>

        <CalendarCarousel 
          title="Personal Calendar"
          subtitle="Your personal workout schedule"
        >
          <div className="flex overflow-x-auto md:overflow-x-visible md:grid md:grid-cols-7 gap-4 pb-4 md:pb-0">
            {Array.from({ length: 7 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() + i);
              const dateStr = date.toISOString().split('T')[0];
              const dayEvents = personalEvents.filter(event => event.date === dateStr);
              
              return (
                <PersonalCalendarDay
                  key={dateStr}
                  date={dateStr}
                  events={dayEvents}
                />
              );
            })}
          </div>
        </CalendarCarousel>

        {googleCalendarID && ready ? (
          <div className="bg-white rounded-2xl p-6 shadow-md transition-all hover:translate-y-[-2px] hover:shadow-lg">
            <h3 className="text-[#003262] mb-4 text-xl font-semibold">Google Calendar</h3>
            <iframe
              src={`https://calendar.google.com/calendar/embed?src=${googleCalendarID}&ctz=America%2FLos_Angeles`}
              className="w-full h-[400px] rounded-lg border-0"
              frameBorder="0"
              scrolling="no"
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 shadow-md transition-all hover:translate-y-[-2px] hover:shadow-lg text-center">
            <p className="text-gray-600 mb-4">
              Connect your Google Calendar to view your schedule
            </p>
            {showGCalInput ? (
              <div className="max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Enter your Google Calendar ID"
                  value={googleCalendarID}
                  onChange={(e) => setGoogleCalendarID(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200 mb-3 text-sm focus:border-[#003262] focus:outline-none"
                />
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setShowGCalInput(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-600 border-none rounded-lg text-sm font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setReady(true);
                      if (googleCalendarID) setShowGCalInput(false);
                    }}
                    className={`px-6 py-3 bg-[#003262] text-white border-none rounded-lg text-sm font-semibold cursor-pointer ${
                      !googleCalendarID ? 'opacity-50' : ''
                    }`}
                  >
                    Connect
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowGCalInput(true)}
                className="px-6 py-3 bg-[#003262] text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-[#FDB515]"
              >
                Connect Google Calendar
              </button>
            )}
            <p className="text-gray-600 text-xs mt-4">
              You can find your Calendar ID in Google Calendar Settings
            </p>
          </div>
        )}

        {showWeightModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div ref={weightModalRef} className="bg-white rounded-2xl p-8 w-[480px] shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-semibold text-[#003262]">Update Weight</h4>
                <button
                  onClick={() => setShowWeightModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Weight (lbs)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter your current weight"
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm transition-all focus:border-[#003262] focus:outline-none"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal Weight (lbs)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter your goal weight"
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm transition-all focus:border-[#003262] focus:outline-none"
                    value={newWeightGoal}
                    onChange={(e) => setNewWeightGoal(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  className="px-6 py-3 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors"
                  onClick={() => setShowWeightModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-3 bg-[#003262] text-white rounded-xl text-sm font-semibold transition-all hover:bg-[#002142] disabled:opacity-50"
                  onClick={updateWeight}
                  disabled={!newWeight && !newWeightGoal}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default FitnessDashboard;
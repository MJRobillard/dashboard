'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
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
} from 'chart.js';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import useEmblaCarousel from 'embla-carousel-react';
import { createPortal } from 'react-dom';
import { 
  UserIcon, 
  TrophyIcon, 
  BoltIcon, 
  FireIcon, 
  UserPlusIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
  Bars4Icon,
  Cog6ToothIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
// Firebase auth helpers
import { useFirebase } from './contexts/FirebaseContext';
import { useGoogleCalendar } from './contexts/GoogleCalendarContext';
import { convertGoogleEventsToCalendarEvents } from './utils/googleCalendar';
import { useRouter } from 'next/navigation';
import { GoogleCalendarViews } from './components/GoogleCalendarViews';
import { PersonalTimeline } from './components/PersonalTimeline';
import { db } from './utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { GymFriends } from './components/GymFriends';
import { RSFOccupancyAnalysis } from './components/RSFOccupancyAnalysis';

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
  notes?: string;
  isGoogleEvent?: boolean;
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
  icon: JSX.Element;
  unlocked: boolean;
  unlockedDate?: string;
}

interface GymFriend {
  id: string;
  name: string;
  email: string;
  avatar: JSX.Element;
  lastWorkout?: string;
  nextWorkout?: string;
  workoutCount: number;
  isOnline: boolean;
}

// Custom Portal-based Popover Component
interface PortalPopoverProps {
  isOpen: boolean;
  children: React.ReactNode;
  content: React.ReactNode | (() => React.ReactNode);
  positions?: string[];
  onClickOutside?: () => void;
}

const PortalPopover: React.FC<PortalPopoverProps> = ({
  isOpen,
  children,
  content,
  onClickOutside
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClickOutside?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClickOutside]);

  const contentElement = typeof content === 'function' ? content() : content;

  return (
    <>
      <div ref={triggerRef}>
        {children}
      </div>
      {isOpen && typeof window !== 'undefined' && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            zIndex: 999999
          }}
        >
          {contentElement}
        </div>,
        document.body
      )}
    </>
  );
};

const CalendarCarousel: React.FC<{
  children: React.ReactNode;
  title: string;
  subtitle: string;
}> = ({ children, title, subtitle }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    slidesToScroll: 1,
    loop: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-yellow-300 mb-1 text-xl font-semibold">{title}</h3>
            <p className="text-sm text-white/75">{subtitle}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className={`p-2 rounded-lg transition-all ${
                canScrollPrev 
                  ? 'bg-yellow-300/10 hover:bg-yellow-300/20 text-yellow-300' 
                  : 'bg-slate-700/50 text-white/30 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className={`p-2 rounded-lg transition-all ${
                canScrollNext 
                  ? 'bg-yellow-300/10 hover:bg-yellow-300/20 text-yellow-300' 
                  : 'bg-slate-700/50 text-white/30 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-4">
            {React.Children.map(children, (child, i) => (
              <div
                className="pl-4 flex-shrink-0 w-[90%] md:w-[60%]"
                style={{ 
                  marginRight: i === React.Children.count(children) - 1 ? 0 : '2%', 
                  marginLeft: i === 0 ? '2%' : 0
                }}
              >
                {child}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-1 mt-4">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === selectedIndex ? 'bg-yellow-300 w-4' : 'bg-yellow-300/30'
              }`}
              onClick={() => emblaApi?.scrollTo(index)}
            />
          ))}
        </div>
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
  const [percentFull, setPercentFull] = useState<number | null>(null);

  // Access authenticated user early for Firestore persistence
  const { user, loading, signOut } = useFirebase();

  // Google Calendar context
  const { 
    isAuthenticated: isGCalAuthenticated, 
    isLoading: isGCalLoading, 
    tokens: gCalTokens, 
    calendars, 
    selectedCalendar, 
    googleEvents,
    authenticate: authenticateGCal, 
    handleAuthCallback, 
    selectCalendar, 
    disconnect: disconnectGCal, 
    refreshTokens: refreshGCalTokens,
    fetchCalendarEvents,
    createEvent: createGCalEvent
  } = useGoogleCalendar();

  // Simple combined events - will be enhanced when Google Calendar is connected
  const combinedEvents = useMemo(() => {
    let events = [...personalEvents];
    
    // Add Google Calendar events if authenticated and calendar is selected
    if (isGCalAuthenticated && selectedCalendar && googleEvents.length > 0) {
      const convertedGoogleEvents = convertGoogleEventsToCalendarEvents(googleEvents);
      console.log('Combined events:', {
        personalCount: personalEvents.length,
        googleCount: googleEvents.length,
        convertedCount: convertedGoogleEvents.length,
        totalCount: events.length + convertedGoogleEvents.length,
        googleEvents: convertedGoogleEvents.map(e => ({ title: e.title, date: e.date, time: e.time }))
      });
      events = [...events, ...convertedGoogleEvents];
    } else {
      console.log('Google Calendar status:', {
        isAuthenticated: isGCalAuthenticated,
        hasSelectedCalendar: !!selectedCalendar,
        eventsCount: googleEvents.length,
        isLoading: isGCalLoading
      });
    }
    
    return events;
  }, [personalEvents, isGCalAuthenticated, selectedCalendar, googleEvents, isGCalLoading]);

  const [gymFriends, setGymFriends] = useState<GymFriend[]>([
    {
      id: '1',
      name: 'Oski Bear',
      email: 'oski@berkeley.edu',
      avatar: <UserIcon className="w-6 h-6" />,
      lastWorkout: 'Yesterday',
      nextWorkout: 'Today at 3 PM',
      workoutCount: 42,
      isOnline: true
    },
    {
      id: '2',
      name: 'Golden Bear',
      email: 'golden@berkeley.edu',
      avatar: <BoltIcon className="w-6 h-6" />,
      lastWorkout: '2 days ago',
      nextWorkout: 'Tomorrow at 10 AM',
      workoutCount: 35,
      isOnline: false
    },
    {
      id: '3',
      name: 'Cal Spirit',
      email: 'spirit@berkeley.edu',
      avatar: <FireIcon className="w-6 h-6" />,
      lastWorkout: 'Today',
      nextWorkout: 'Thursday at 2 PM',
      workoutCount: 28,
      isOnline: true
    }
  ]);

  const [searchFriends, setSearchFriends] = useState('');
  const [selectedWorkoutType, setSelectedWorkoutType] = useState('');

  const [workoutProgress, setWorkoutProgress] = useState<WorkoutProgress>({
    arms: -1,
    legs: -1,
    back: -1,
    core: -1,
    chest: -1,
    flexibility: -1
  });

  const [timeScale, setTimeScale] = useState<'7d' | '14d' | '30d'>('7d');

  // Update initial state to always start at 0 if no data
  const [weightProgress, setWeightProgress] = useState<WeightProgress>({
    current: 0,
    goal: 0,
    history: [{ date: new Date().toISOString().split('T')[0], weight: 0 }],
  });
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState<string>('');
  const [newWeightGoal, setNewWeightGoal] = useState<string>('');
  const weightModalRef = useRef<HTMLDivElement>(null);
  
  // 🔥 Firestore sync helpers
  const hasLoadedUserData = useRef(false);

  // Load user data from Firestore once the user is available
  useEffect(() => {
    if (user && !hasLoadedUserData.current) {
      const loadUserData = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snapshot = await getDoc(userDocRef);
          if (snapshot.exists()) {
            const data = snapshot.data() as any;
            console.log('🔥 Firestore user data:', data);
            if (data.workoutData) setWorkoutData(data.workoutData);
            if (data.workoutProgress) setWorkoutProgress(data.workoutProgress);
            let loadedWeightProgress = data.weightProgress || {};
            // Ensure history always starts at 0
            if (!loadedWeightProgress.history || loadedWeightProgress.history.length === 0) {
              loadedWeightProgress.history = [{ date: new Date().toISOString().split('T')[0], weight: 0 }];
              loadedWeightProgress.current = 0;
              loadedWeightProgress.goal = 0;
            } else if (loadedWeightProgress.history[0].weight !== 0) {
              loadedWeightProgress.history = [
                { date: loadedWeightProgress.history[0].date, weight: 0 },
                ...loadedWeightProgress.history
              ];
            }
            setWeightProgress(loadedWeightProgress);
          } else {
            setWeightProgress({ current: 0, goal: 0, history: [{ date: new Date().toISOString().split('T')[0], weight: 0 }] });
          }
        } catch (err) {
          console.error('Error loading user workout data', err);
        } finally {
          hasLoadedUserData.current = true;
        }
      };
      loadUserData();
    }
  }, [user]);

  // Save user data to Firestore whenever it changes (after initial load)
  useEffect(() => {
    if (user && hasLoadedUserData.current) {
      const saveUserData = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(
            userDocRef,
            {
              workoutData,
              workoutProgress,
              weightProgress, // This now always includes updated goal weight
            },
            { merge: true }
          );
        } catch (err) {
          console.error('Error saving user workout data', err);
        }
      };
      saveUserData();
    }
  }, [user, workoutData, workoutProgress, weightProgress]);

  // Replace with Legal Evergreen theme colors
  const coolGray = '#4B5563';
  const richBrown = '#7C4A03';
  const deepGreen = '#1B4332';
  const white = '#FFFFFF';

  const [isMobile, setIsMobile] = useState(false);

  const [isFriendsPopoverOpen, setIsFriendsPopoverOpen] = useState(false);
  const friendsButtonRef = useRef(null);

  const filteredFriends = useMemo(() => {
    return gymFriends.filter(friend => 
      friend.name.toLowerCase().includes(searchFriends.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchFriends.toLowerCase())
    );
  }, [gymFriends, searchFriends]);

  const onlineFriendsCount = useMemo(() => {
    return filteredFriends.filter(f => f.isOnline).length;
  }, [filteredFriends]);

  const onlineFriends = useMemo(() => {
    return filteredFriends.filter(f => f.isOnline);
  }, [filteredFriends]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    // Initialize with no workouts; data will be loaded from Firestore when available
    setWorkoutData([]);

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
    const completionRate = workoutData.length === 0 ? 0 : workoutData.filter(w => w.completed).length / workoutData.length;
    if (workoutData.length === 0) {
      setMotivationalMessage("Welcome! Start logging workouts to see your progress soar.");
    } else if (completionRate > 0.8) {
      setMotivationalMessage("🐻 GO BEARS! You're crushing it! Keep up the amazing work!");
    } else if (completionRate > 0.6) {
      setMotivationalMessage("Strong progress Very IMPRESSIVE!!");
    } else {
      setMotivationalMessage("Every journey starts with a single step. Let's go, Bear!");
    }
  }, [workoutData]);

  // Reset Firestore load flag whenever the signed-in user changes
  useEffect(() => {
    hasLoadedUserData.current = false;
  }, [user?.uid]);

  const achievements: Achievement[] = [
    { 
      id: '1', 
      title: 'First Workout', 
      description: 'Complete your first workout', 
      icon: <BoltIcon className="w-6 h-6" />, 
      unlocked: true, 
      unlockedDate: '2024-01-15' 
    },
    { 
      id: '2', 
      title: 'Week Warrior', 
      description: '7 consecutive days', 
      icon: <FireIcon className="w-6 h-6" />, 
      unlocked: true, 
      unlockedDate: '2024-01-22' 
    },
    { 
      id: '4', 
      title: 'Cal Champion', 
      description: '30 day streak', 
      icon: <TrophyIcon className="w-6 h-6" />, 
      unlocked: false 
    }
  ];

  const getTimeScaleDays = () => {
    switch (timeScale) {
      case '14d': return 14;
      case '30d': return 30;
      default: return 7;
    }
  };

  const METER_CONFIG = {
    RSF: {
      displayName: 'RSF',
      apiToken: process.env.NEXT_PUBLIC_DENSITY_RSF_TOKEN || 'shr_o69HxjQ0BYrY2FPD9HxdirhJYcFDCeRolEd744Uj88e',
    },
    CMS: {
      displayName: 'CMS',
      apiToken: process.env.NEXT_PUBLIC_DENSITY_CMS_TOKEN || 'shr_CPp9qbE0jN351cCEQmtDr4R90r3SIjZASSY8GU5O3gR',
    },
  } as const;
  
  type MeterKey = keyof typeof METER_CONFIG;
  

  
    useEffect(() => {
      const fetchUtil = async () => {
        const { apiToken, displayName } = METER_CONFIG[selectedMeter];
        try {
          const res = await fetch(
            'https://api.density.io/v2/spaces?page=1&page_size=5000',
            {
              headers: {
                accept: 'application/json, text/plain, */*',
                authorization: `Bearer ${apiToken}`,
              },
            }
          );
          const data = await res.json();
          console.log(data);
          const count = data.results[0].current_count;
          const capacity = data.results[0].capacity;
          console.log(count, capacity);

          if (capacity) {
            setPercentFull(
              Math.round((count / capacity) * 100)
            );
          } else {
            setPercentFull(null);
          }
        } catch (err) {
          console.error('Error fetching density data', err);
          setPercentFull(null);
        }
      };
  
      fetchUtil();
    }, [selectedMeter]);
  

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
        borderColor: '#FDB515', // Cal Gold
        backgroundColor: 'rgba(253, 181, 21, 0.2)', // Cal Gold with opacity
        tension: 0.4,
        borderWidth: 2
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
        borderColor: '#00A0DC', // Berkeley Blue
        backgroundColor: 'rgba(0, 160, 220, 0.2)', // Berkeley Blue with opacity
        tension: 0.4,
        borderWidth: 2
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
        borderColor: '#FF6B6B', // Coral Red
        backgroundColor: 'rgba(255, 107, 107, 0.2)', // Coral Red with opacity
        tension: 0.4,
        borderWidth: 2
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
        borderColor: '#4CAF50', // Green
        backgroundColor: 'rgba(76, 175, 80, 0.2)', // Green with opacity
        tension: 0.4,
        borderWidth: 2
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
        borderColor: '#9C27B0', // Purple
        backgroundColor: 'rgba(156, 39, 176, 0.2)', // Purple with opacity
        tension: 0.4,
        borderWidth: 2
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
        borderColor: '#FF9800', // Orange
        backgroundColor: 'rgba(255, 152, 0, 0.2)', // Orange with opacity
        tension: 0.4,
        borderWidth: 2
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          color: '#FDB515',
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#FDB515',
        bodyColor: '#FFFFFF',
        borderColor: '#FDB515',
        borderWidth: 1,

      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#FFFFFF',
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          }
        },
        title: {
          display: true,
          text: 'Workouts Completed',
          color: '#FDB515',
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date',
          color: '#FDB515',
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        },
        ticks: {
          color: '#FFFFFF',
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
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
        deepGreen,
        richBrown,
        coolGray,
        '#2E8B57',
        '#4B0082',
        '#FF6B6B'
      ],
      borderWidth: 0
    }]
  };

  const workoutTypeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          color: '#FDB515',
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          }
        },
      }
    }
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

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        day: 'numeric',
        month: 'short'
      });
    };

    return (
      <div
        ref={drop as unknown as React.LegacyRef<HTMLDivElement>}
        className={`h-[300px] ${
          isOver ? 'bg-yellow-300/5' : 'bg-slate-800/40'
        } border-2 ${
          isToday ? 'border-yellow-300' : isOver ? 'border-yellow-300/30' : 'border-yellow-300/10'
        } rounded-xl p-3 transition-all w-full flex-shrink-0 backdrop-blur-sm relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
        <div style={{ 
          color: isToday ? '#FDB515' : 'rgba(255,255,255,0.75)',
          fontWeight: isToday ? '600' : '500'
        }} className="text-sm mb-2 relative z-10">
          {dayName}, {formatDate(date)}
        </div>
        <div style={{ maxHeight: 'calc(100% - 2rem)', overflowY: 'auto' }} className="scrollbar-thin scrollbar-thumb-yellow-300/30 scrollbar-track-transparent relative z-10">
          {events.length > 0 ? (
            events.map(event => (
              <DraggableEvent key={event.id} event={event} />
            ))
          ) : (
            <div style={{ 
              fontSize: '10px', 
              color: 'rgba(255,255,255,0.5)', 
              textAlign: 'center',
              padding: '8px 0'
            }}>
              Loading...
            </div>
          )}
        </div>
      </div>
    );
  };

  const DraggableEvent: React.FC<{ event: CalendarEvent }> = ({ event }) => {
    const handleAddToPersonal = () => {
      setPersonalEvents(prev => {
        if (prev.some(e => e.title === event.title && e.date === event.date && e.time === event.time)) {
          return prev;
        }
        return [
          ...prev,
          {
            ...event,
            id: `personal-${event.id}-${Date.now()}`,
            isPersonal: true
          }
        ];
      });
    };
    return (
      <div
        className="p-3 rounded-lg text-white text-sm mb-2 transition-all hover:opacity-90 w-full bg-gradient-to-br from-slate-700/90 to-slate-800/90 backdrop-blur-sm relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col gap-2 relative z-10">
          <div className="flex-1">
            <div className="font-semibold mb-1">{event.title}</div>
            {event.time && <div className="opacity-90 text-xs">{event.time}</div>}
            {event.instructor && <div className="opacity-80 text-xs">{event.instructor}</div>}
          </div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToGoogleCalendar(event);
              }}
              className="flex-1 px-2 py-1 bg-yellow-300/10 hover:bg-yellow-300/20 rounded text-xs font-semibold text-yellow-300 transition-colors border border-yellow-300/20 min-w-0 truncate"
            >
              GCal
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToPersonal();
              }}
              className="flex-1 px-2 py-1 bg-blue-900/20 hover:bg-blue-900/40 rounded text-xs font-semibold text-blue-300 transition-colors border border-blue-300/20 min-w-0 truncate"
            >
              Add to Personal
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PersonalCalendarDay: React.FC<{ date: string; events: CalendarEvent[] }> = ({ date, events }) => {
    const [{ isOver }, drop] = useDrop<CalendarEvent, void, { isOver: boolean }>({
      accept: 'personal-event',
      drop: (item: CalendarEvent, monitor) => {
        const clientOffset = monitor.getClientOffset();
        if (clientOffset) {
          const timeSlot = Math.floor((clientOffset.y - 100) / 50);
          const hour = Math.max(6, Math.min(22, timeSlot + 6));
          const time = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;

          setPersonalEvents(prev => prev.map(e => 
            e.id === item.id ? { ...e, date, time } : e
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
      type: 'personal',
      time: '',
      notes: '',
      isPersonal: true
    });

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        day: 'numeric',
        month: 'short'
      });
    };

    const timeSlots = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM

    const formatTimeSlot = (hour: number) => {
      if (hour === 12) return '12:00 PM';
      if (hour > 12) return `${hour - 12}:00 PM`;
      return `${hour}:00 AM`;
    };

    const handleAddEvent = () => {
      if (newEvent.title.trim()) {
        setPersonalEvents(prev => [...prev, { ...newEvent, id: `personal-${Date.now()}` }]);
        setShowAddModal(false);
        setNewEvent({
          id: '',
          date,
          title: '',
          type: 'personal',
          time: '',
          notes: '',
          isPersonal: true
        });
      }
    };

    return (
      <div
        ref={drop as unknown as React.LegacyRef<HTMLDivElement>}
        className={`h-[350px] bg-slate-800/40 border rounded-lg p-4 transition-all w-full flex-shrink-0 backdrop-blur-sm relative overflow-hidden ${
          isOver ? 'border-yellow-300/30 bg-yellow-300/5' : 'border-yellow-300/10'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm font-semibold text-yellow-300">{formatDate(date)}</div>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-1.5 bg-yellow-300/10 hover:bg-yellow-300/20 rounded-lg text-yellow-300 transition-colors"
            >
              <UserPlusIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-visible scrollbar-thin scrollbar-thumb-yellow-300/30 scrollbar-track-transparent">
            <div className="relative">
              {timeSlots.map(hour => (
                <div
                  key={hour}
                  className="h-[50px] border-b border-yellow-300/10 flex items-center"
                >
                  <div className="w-16 text-xs text-yellow-300/50 flex-shrink-0">
                    {formatTimeSlot(hour)}
                  </div>
                  <div className="flex-1 h-full relative pl-2">
                    <div className="max-w-[calc(100%-8px)]">
                      {events
                        .filter(event => {
                          if (!event.time) return false;
                          const [eventHour, period] = event.time.split(' ');
                          const hourNum = parseInt(eventHour);
                          return period === 'PM' ? hourNum + 12 === hour : hourNum === hour;
                        })
                        .map(event => (
                          <PersonalEvent key={event.id} event={event} />
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-slate-800/90 rounded-lg p-4 w-full max-w-[90vw] md:max-w-md border border-yellow-300/20 backdrop-blur-sm" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-yellow-300">Add Personal Workout</h3>
                <button onClick={() => setShowAddModal(false)} className="text-yellow-300/75 hover:text-yellow-300">
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                <div>
                  <label className="block text-sm font-medium text-yellow-300/75 mb-0">Title</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-yellow-300/20 rounded-md text-sm text-white"
                    placeholder="Workout title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-yellow-300/75 mb-1">Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={e => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-yellow-300/20 rounded-md text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-yellow-300/75 mb-1">
                  </label>
                  <textarea
                    value={newEvent.notes}
                    onChange={e => setNewEvent(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-1 bg-slate-700/50 border border-yellow-300/20 rounded-md text-sm text-white min-h-[40px] resize-y"
                    placeholder="Add any notes about your workout..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4 mt-4 border-t border-yellow-300/20">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-sm border border-yellow-300/20 text-yellow-300/75 rounded-md hover:bg-yellow-300/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  className="px-3 py-1.5 text-sm bg-yellow-300/10 hover:bg-yellow-300/20 text-yellow-300 rounded-md border border-yellow-300/20"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const PersonalEvent: React.FC<{ event: CalendarEvent }> = ({ event }) => {
    const [{ isDragging }, drag, preview] = useDrag({
      type: 'personal-event',
      item: event,
      collect: monitor => {
        const dragging = monitor.isDragging();
        if (dragging) console.log('✈️ Dragging personal-event:', event);
        return { isDragging: dragging };
      }
    });

    const addToGoogleCalendar = async (event: CalendarEvent) => {
      // If user is not authenticated with Google Calendar, open the Google Calendar page
      if (!isGCalAuthenticated || !selectedCalendar) {
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
          details: event.notes || 'Personal Workout',
          dates: `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          location: 'RSF Berkeley'
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
          description: event.notes || 'Personal Workout',
          startDateTime: startDate.toISOString(),
          endDateTime: endDate.toISOString(),
          location: 'RSF Berkeley'
        });

        if (result.success) {
          // Show success message (you could add a toast notification here)
          console.log('Event added to Google Calendar successfully!');
          // Optionally refresh the events list
          await fetchCalendarEvents();
        } else {
          console.error('Failed to add event to Google Calendar:', result.error);
          // Fallback to opening Google Calendar page
          const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: event.title,
            details: event.notes || 'Personal Workout',
            dates: `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
            location: 'RSF Berkeley'
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
          details: event.notes || 'Personal Workout',
          dates: `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          location: 'RSF Berkeley'
        });

        window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
      }
    };

    const isGoogleEvent = event.isGoogleEvent || event.type === 'google';

    return (
      <div
        ref={preview as unknown as React.LegacyRef<HTMLDivElement>}
        className={`p-2 rounded-lg text-white text-xs mb-1 transition-all w-full flex items-center backdrop-blur-sm relative overflow-hidden ${isDragging ? 'opacity-50' : 'hover:opacity-90'} max-h-[46px] ${
          isGoogleEvent 
            ? 'bg-gradient-to-br from-green-700/90 to-green-800/90' 
            : 'bg-gradient-to-br from-slate-700/90 to-slate-800/90'
        }`}
      >
        <div className={`absolute inset-0 pointer-events-none ${
          isGoogleEvent 
            ? 'bg-gradient-to-tr from-green-300/10 via-transparent to-transparent' 
            : 'bg-gradient-to-tr from-yellow-300/10 via-transparent to-transparent'
        }`} />
        <div
          ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
          className="cursor-move mr-2 flex-shrink-0 relative z-10 w-8 h-8 sm:w-5 sm:h-5 flex items-center justify-center"
        >
          <Bars4Icon className={`w-8 h-8 sm:w-5 sm:h-5 ${isGoogleEvent ? 'text-green-300' : 'text-yellow-300'}`} />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden relative z-10">
          <div className="font-semibold truncate max-w-[50px] flex items-center gap-1">
            {isGoogleEvent && <span className="text-green-300 text-[8px]">📅</span>}
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
          {!isGoogleEvent && (
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

  // In updateWeight, always ensure history starts at 0
  const updateWeight = () => {
    setWeightProgress(prev => {
      let newHistory = prev.history;
      if (newHistory.length === 0 || newHistory[0].weight !== 0) {
        newHistory = [{ date: new Date().toISOString().split('T')[0], weight: 0 }, ...newHistory];
      }
      if (newWeight) {
        const weight = parseFloat(newWeight);
        newHistory = [...newHistory, { date: new Date().toISOString().split('T')[0], weight }];
        return {
          ...prev,
          current: weight,
          history: newHistory
        };
      }
      if (newWeightGoal) {
        return {
          ...prev,
          goal: parseFloat(newWeightGoal),
          history: newHistory
        };
      }
      return { ...prev, history: newHistory };
    });
    setNewWeight('');
    setNewWeightGoal('');
    setShowWeightModal(false);
  };

  // In weightChartData, always start with 0
  const weightChartData = {
    labels: weightProgress.history.map(w => new Date(w.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Current Weight',
        data: weightProgress.history.map(w => w.weight),
        borderColor: '#FDB515',
        backgroundColor: 'rgba(253, 181, 21, 0.2)',
        tension: 0.4,
        borderWidth: 2,
        fill: true
      },
      {
        label: 'Goal Weight',
        data: Array(weightProgress.history.length).fill(weightProgress.goal),
        borderColor: '#00A0DC',
        backgroundColor: 'rgba(0, 160, 220, 0.1)',
        borderDash: [5, 5],
        tension: 0,
        borderWidth: 2,
        fill: false
      }
    ]
  };

  const weightChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          color: '#FDB515',
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          }
        },

      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#FDB515',
        bodyColor: '#FFFFFF',
        borderColor: '#FDB515',
        borderWidth: 1,
        padding: 10,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#FFFFFF',
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          }
        },
        title: {
          display: true,
          text: 'Weight (lbs)',
          color: '#FDB515',
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date',
          color: '#FDB515',
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        },
        ticks: {
          color: '#FFFFFF',
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
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
      details: event.notes || 'Personal Workout',
      dates: `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      location: 'RSF Berkeley'
    });

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
  };

  const MemoizedCalendarDay = React.memo(CalendarDay);
  const MemoizedDraggableEvent = React.memo(DraggableEvent);
  const MemoizedPersonalCalendarDay = React.memo(PersonalCalendarDay);
  const MemoizedPersonalEvent = React.memo(PersonalEvent);

  const [addFriendEmail, setAddFriendEmail] = useState('');
  const [addFriendError, setAddFriendError] = useState('');

  const handleAddFriend = () => {
    setGymFriends(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: addFriendEmail.split('@')[0].replace(/\W/g, '').replace(/\b\w/g, l => l.toUpperCase()) || 'New Friend',
        email: addFriendEmail,
        avatar: <UserIcon className="w-6 h-6" />,
        lastWorkout: 'Never',
        nextWorkout: 'TBD',
        workoutCount: 0,
        isOnline: false
      }
    ]);
    setAddFriendEmail('');
    setAddFriendError('');
  };

  // NEW_COMPONENT_START
  // PersonalScheduleGrid component replaced with PersonalTimeline
  /*
  const PersonalScheduleGrid: React.FC<{
    personalEvents: CalendarEvent[];
    setPersonalEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
    combinedEvents?: CalendarEvent[];
  }> = ({ personalEvents, setPersonalEvents, combinedEvents = [] }) => {
    // ... component implementation removed ...
  };
  */

  // Modal for logging a workout from the Achievements card
  const [showLogModal, setShowLogModal] = useState(false);
  const [showLayoutConfigModal, setShowLayoutConfigModal] = useState(false);
  const logModalRef = useRef<HTMLDivElement>(null);
  const layoutModalRef = useRef<HTMLDivElement>(null);

  // Close log modal on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (logModalRef.current && !logModalRef.current.contains(event.target as Node)) {
        setShowLogModal(false);
      }
    };

    if (showLogModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLogModal]);

  // Close layout config modal on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (layoutModalRef.current && !layoutModalRef.current.contains(event.target as Node)) {
        setShowLayoutConfigModal(false);
      }
    };

    if (showLayoutConfigModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLayoutConfigModal]);

  // Temporary state for editing goals
  const [tempGoals, setTempGoals] = useState<WorkoutProgress>(workoutProgress);

  useEffect(() => {
    if (showGoalModal) {
      setTempGoals(workoutProgress);
    }
  }, [showGoalModal, workoutProgress]);

  // ─────────────────────────────────────────
  // Auth state & conditional rendering
  const router = useRouter();
  const [isProfilePopoverOpen, setIsProfilePopoverOpen] = useState(false);
  const profileButtonRef = useRef(null);

  // Remove authentication redirect - allow users to view without login
  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.push('/auth');
  //   }
  // }, [loading, user, router]);
  // ─────────────────────────────────────────

  // Replace the existing Google Calendar section with this new implementation
  const GoogleCalendarSection = () => {
    if (isGCalAuthenticated && selectedCalendar) {
      return (
        <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6 md:p-8 backdrop-blur-sm relative overflow-hidden mt-6">
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-yellow-300 text-xl font-bold">Google Calendar</h3>
              <div className="flex gap-2">
                <select
                  value={selectedCalendar?.id || ''}
                  onChange={(e) => {
                    const calendar = calendars.find(cal => cal.id === e.target.value);
                    if (calendar) selectCalendar(calendar);
                  }}
                  className="px-3 py-1 bg-slate-700/50 border border-yellow-300/30 rounded-lg text-sm text-white focus:outline-none focus:border-yellow-300"
                >
                  {calendars.map(calendar => (
                    <option key={calendar.id} value={calendar.id}>
                      {calendar.summary}
                    </option>
                  ))}
                </select>
                <button
                  onClick={disconnectGCal}
                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-300/30 rounded-lg text-sm text-red-300 transition-all"
                >
                  Disconnect
                </button>
              </div>
            </div>
            {selectedCalendar && (
              <iframe
                src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(selectedCalendar.id)}&ctz=America%2FLos_Angeles`}
                className="w-full h-[500px] rounded-lg border-0"
              />
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden mt-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-md mx-auto">
          <h3 className="text-yellow-300 text-xl font-bold mb-4">Connect Google Calendar</h3>
          {isGCalLoading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-300 mb-4"></div>
              <p className="text-white/75">Connecting to Google...</p>
            </div>
          ) : (
            <>
              <p className="text-white/75 mb-6">Link your Google Calendar to see your events alongside workouts and RSF classes.</p>
              <button
                onClick={authenticateGCal}
                className="px-6 py-3 bg-yellow-300 text-blue-950 rounded-xl text-sm font-semibold transition-all hover:bg-yellow-400 flex items-center justify-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  />
                </svg>
                Connect with Google
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  type CardKey = 'rsfSchedule' | 'crowdMeter' | 'achievements' | 'workoutProgress' | 'workoutType' | 'weightProgress' | 'progressGoals' | 'friends' | 'personalTimeline' | 'rsfOccupancy';
  interface LayoutItem { key: CardKey; title: string; colSpan: 1 | 2 | 3; minColSpan?: number }
  const DEFAULT_LAYOUT: LayoutItem[] = [
    { key: 'rsfSchedule', title: 'RSF Schedule', colSpan: 2, minColSpan: 2 },
    { key: 'crowdMeter', title: 'Crowd Meter', colSpan: 1 },
    { key: 'achievements', title: 'Achievements', colSpan: 1 },
    { key: 'personalTimeline', title: 'Personal Timeline', colSpan: 3, minColSpan: 2 },
    { key: 'rsfOccupancy', title: 'RSF Occupancy Analysis', colSpan: 3, minColSpan: 2 },
    { key: 'workoutProgress', title: 'Workout Progress', colSpan: 1 },
    { key: 'workoutType', title: 'Workout Type Distribution', colSpan: 1 },
    { key: 'weightProgress', title: 'Weight Progress', colSpan: 1 },
    { key: 'progressGoals', title: 'Progress Goals', colSpan: 3 },
    { key: 'friends', title: 'Gym Friends', colSpan: 3 },
  ];

  const mergeWithDefaults = (stored: LayoutItem[]): LayoutItem[] => {
    const defMap = new Map(DEFAULT_LAYOUT.map(d => [d.key, d]));
    const seen = new Set<CardKey>();
    const merged: LayoutItem[] = [];

    // keep stored order
    stored.forEach(item => {
      const def = defMap.get(item.key);
      if (def) {
        merged.push({ ...def, ...item }); // inherit potential new props
        seen.add(item.key);
      }
    });

    // append any defaults not present in stored
    DEFAULT_LAYOUT.forEach(def => {
      if (!seen.has(def.key)) merged.push(def);
    });

    return merged;
  };

  const [layoutConfig, setLayoutConfig] = useState<LayoutItem[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('layoutConfig');
      if (stored) {
        try {
          const parsed: LayoutItem[] = JSON.parse(stored);
          return mergeWithDefaults(parsed);
        } catch {}
      }
    }
    return DEFAULT_LAYOUT;
  });

  // persist config
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('layoutConfig', JSON.stringify(layoutConfig));
    }
  }, [layoutConfig]);

  const moveItem = (index: number, direction: -1 | 1) => {
    setLayoutConfig(prev => {
      const newArr = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= newArr.length) return prev;
      const [item] = newArr.splice(index, 1);
      newArr.splice(targetIndex, 0, item);
      console.log('🚚 moveItem', { from: index, to: targetIndex, result: newArr });
      return newArr;
    });
  };

  const updateColSpan = (key: CardKey, span: 1 | 2 | 3) => {
    setLayoutConfig(prev => {
      const updated = prev.map(it => it.key === key ? { ...it, colSpan: span } : it);
      console.log('📏 updateColSpan', { key, span, result: updated });
      return updated;
    });
  };

  // ───────────── Cards built from layoutConfig ─────────────
  const RsfScheduleCard = () => (
    <CalendarCarousel title="RSF Class Schedule" subtitle="Browse and join group fitness classes">
      {generateCalendarDays().map(day => (
        <MemoizedCalendarDay key={day.date} {...day} />
      ))}
    </CalendarCarousel>
  );

  const CrowdMeterCard = () => (
    <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden flex flex-col h-full">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-yellow-300 text-xl font-bold m-0">
            {METER_CONFIG[selectedMeter].displayName} Crowd Meter
          </h3>
          <div className="flex gap-2">
            {Object.keys(METER_CONFIG).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedMeter(key as MeterKey)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border shadow-sm ${
                  selectedMeter === key
                    ? 'bg-yellow-300 text-blue-950 border-yellow-300'
                    : 'bg-slate-700/50 text-yellow-300 border-yellow-300/30 hover:bg-yellow-300/10'
                }`}
              >
                {METER_CONFIG[key as MeterKey].displayName}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="12" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#facc15"
                strokeWidth="12"
                strokeDasharray={2 * Math.PI * 52}
                strokeDashoffset={2 * Math.PI * 52 * (1 - (percentFull ?? 0) / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(.4,2,.6,1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-yellow-300 drop-shadow-lg">
                {percentFull !== null ? `${percentFull}%` : <span className="text-lg text-white/70">--</span>}
              </span>
              <span className="text-white/70 text-lg mt-1">Full</span>
            </div>
          </div>
          <div className="mt-4 text-white/60 text-sm text-center max-w-xs">
            Live crowd meter for {METER_CONFIG[selectedMeter].displayName}. Data updates automatically.
          </div>
        </div>
      </div>
    </div>
  );

  const AchievementsCard = () => (
    <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-yellow-300 text-xl font-bold">Achievements</h3>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowLogModal(true)}
              className="px-4 py-2 bg-yellow-300 text-blue-950 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition-all"
            >
              Log Workout
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`inline-flex items-center rounded-lg p-3 transition-all ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-300/20 to-yellow-300/10 border border-yellow-300/40'
                  : 'bg-blue-900/30 opacity-50'
              }`}
            >
              <div className="text-yellow-300 mr-2">{achievement.icon}</div>
              <div>
                <div className="font-semibold text-sm text-white">{achievement.title}</div>
                <div className="text-xs text-white/75">{achievement.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const WorkoutProgressCard = () => (
    <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-yellow-300 text-xl font-bold">Workout Progress</h3>
      </div>
      <div className="h-[300px]">
        <Line data={consistencyChartData} options={lineChartOptions} />
      </div>
    </div>
  );

  const WorkoutTypeCard = () => (
    <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-yellow-300 text-xl font-bold">Workout Type Distribution</h3>
      </div>
      <div className="h-[300px]">
        <Doughnut data={workoutTypeData} options={workoutTypeOptions} />
      </div>
    </div>
  );

  const WeightProgressCard = () => (
    <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-yellow-300 text-xl font-bold">Weight Progress</h3>
        <button onClick={() => setShowWeightModal(true)} className="px-4 py-2 bg-yellow-300 text-blue-950 rounded-lg text-sm font-semibold hover:bg-yellow-400">Update Weight</button>
      </div>
      <div className="h-[300px]">
        <Line data={weightChartData} options={weightChartOptions} />
      </div>
    </div>
  );

  const PersonalTimelineCard = () => {
    if (!user) {
      return (
        <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 text-center py-8">
            <h3 className="text-yellow-300 text-xl font-bold mb-4">Personal Timeline</h3>
            <p className="text-white/75 mb-6">Sign in to create and manage your personal workout timeline</p>
            <button
              onClick={() => router.push('/auth')}
              className="px-6 py-3 bg-yellow-300 text-blue-950 rounded-xl text-sm font-semibold transition-all hover:bg-yellow-400"
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      );
    }

    return (
      <PersonalTimeline 
        personalEvents={personalEvents}
        setPersonalEvents={setPersonalEvents}
        combinedEvents={combinedEvents}
        isGCalAuthenticated={isGCalAuthenticated}
        selectedCalendar={selectedCalendar}
        googleEvents={googleEvents}
        authenticateGCal={authenticateGCal}
        isGCalLoading={isGCalLoading}
      />
    );
  };

  const ProgressGoalsCard = () => {
    if (!user) {
      return (
        <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 text-center py-8">
            <h3 className="text-yellow-300 text-xl font-bold mb-4">Progress Goals</h3>
            <p className="text-white/75 mb-6">Sign in to track your workout progress and set personal goals</p>
            <button
              onClick={() => router.push('/auth')}
              className="px-6 py-3 bg-yellow-300 text-blue-950 rounded-xl text-sm font-semibold transition-all hover:bg-yellow-400"
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-yellow-300 text-xl font-bold">Progress Goals</h3>
          <button onClick={() => setShowGoalModal(true)} className="px-4 py-2 bg-yellow-300 text-blue-950 rounded-lg text-sm font-semibold hover:bg-yellow-400">Adjust Goals</button>
        </div>
        <div className="flex flex-col gap-3">
          {Object.entries(workoutProgress).map(([type, progress]) => {
            const color = '#FDB515';
            const workoutCount = workoutData.filter(w => w.completed && w.type === type).length;
            return (
              <div key={type} className="flex items-center gap-3">
                <div className="w-24 capitalize text-white" style={{ color }}>{type}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/75">{workoutCount} workouts completed</span>
                    <span className="font-medium text-white">{progress as number}%</span>
                  </div>
                  <div className="h-2 bg-blue-900/50 rounded-full overflow-hidden">
                    <div className="h-full transition-all duration-500 ease-out rounded-full" style={{ width: `${Math.max(0, progress as number)}%`, backgroundColor: color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const FriendsCard = () => {
    if (!user) {
      return (
        <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 text-center py-8">
            <h3 className="text-yellow-300 text-xl font-bold mb-4">Gym Friends</h3>
            <p className="text-white/75 mb-6">Sign in to connect with friends and track your social fitness journey</p>
            <button
              onClick={() => router.push('/auth')}
              className="px-6 py-3 bg-yellow-300 text-blue-950 rounded-xl text-sm font-semibold transition-all hover:bg-yellow-400"
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      );
    }

    return (
      <GymFriends 
        workoutData={workoutData}
        onWorkoutShared={() => {
          // Optionally refresh data when workout is shared
          console.log('Workout shared with friends!');
        }}
      />
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br z-[-10] from-[#000000] via-[#0b1939] to-[#000000] text-white">
        {/* Top Header - Simplified for mobile, full for desktop */}
        <div className="hidden md:flex items-center justify-between mb-6 p-4 lg:p-6 rounded-2xl shadow-[0_0_30px_rgba(253,224,71,0.2)] border border-yellow-300/40 sticky top-0 z-30 bg-[#000000]/80 backdrop-blur-lg">
          <div className="flex items-center gap-4">
            <span className="text-4xl lg:text-5xl animate-bounce">🐻</span>
            <div>
              <h1 className="m-0 text-yellow-300 text-2xl lg:text-3xl font-bold">Fitness Tracker</h1>
              <p className="mt-1 text-white/75 text-sm lg:text-base">Track your fitness journey</p>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <PortalPopover
              isOpen={isFriendsPopoverOpen}
              positions={["bottom"]}
              content={() => (
                <div className="w-64 bg-slate-800 z-[999999] border border-yellow-300/30 rounded-xl shadow-lg p-4 backdrop-blur-sm">
                  <div className="text-yellow-300 font-semibold text-sm mb-2">Online Friends</div>
                  {onlineFriends.length === 0 && (
                    <div className="text-white/50 text-sm italic">No friends online</div>
                  )}
                  <ul className="space-y-2">
                    {onlineFriends.map(friend => (
                      <li key={friend.id} className="flex items-center gap-3 text-white text-sm">
                        <div className="text-yellow-300">{friend.avatar}</div>
                        <div>
                          <div className="font-medium">{friend.name}</div>
                          <div className="text-xs text-white/50">Last: {friend.lastWorkout}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              onClickOutside={() => setIsFriendsPopoverOpen(false)}
            >
              <button
                ref={friendsButtonRef}
                onClick={() => setIsFriendsPopoverOpen(!isFriendsPopoverOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-300/10 hover:bg-yellow-300/20 border border-yellow-300/40 rounded-full text-yellow-300 font-medium text-sm shadow transition-all"
              >
                <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-5a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Friends</span>
                <span className="ml-1 bg-yellow-300 text-blue-950 text-xs font-bold rounded-full px-2 py-0.5 border border-white shadow">{onlineFriendsCount}</span>
              </button>
            </PortalPopover>

            <button
              onClick={() => setShowLayoutConfigModal(true)}
              className="relative flex items-center justify-center w-12 h-12 rounded-full bg-yellow-300/10 border border-yellow-300/40 hover:bg-yellow-300/20 transition-all shadow-md"
              aria-label="Layout Settings"
            >
              <Cog6ToothIcon className="w-6 h-6 text-yellow-300" />
            </button>

            <PortalPopover
              isOpen={isProfilePopoverOpen}
              positions={["bottom"]}
              content={() => (
                user ? (
                  <div className="w-56 bg-slate-800 border border-yellow-300/30 rounded-xl shadow-lg p-4 backdrop-blur-sm text-sm z-[999999]">
                    <div className="flex items-center gap-3 mb-3">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full" />
                      ) : (
                        <UserIcon className="w-6 h-6 text-yellow-300" />
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-yellow-300 truncate">{user.displayName || user.email}</div>
                        <div className="text-white/60 truncate">{user.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setIsProfilePopoverOpen(false); signOut(); }}
                      className="w-full px-3 py-2 bg-yellow-300/10 hover:bg-yellow-300/20 rounded text-yellow-300 font-semibold transition-all"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="w-48 bg-slate-800 border border-yellow-300/30 rounded-xl shadow-lg p-4 backdrop-blur-sm text-sm text-center z-[999999]">
                    <button
                      onClick={() => { setIsProfilePopoverOpen(false); router.push('/auth'); }}
                      className="w-full px-3 py-2 bg-yellow-300/10 hover:bg-yellow-300/20 rounded text-yellow-300 font-semibold transition-all"
                    >
                      Sign In
                    </button>
                  </div>
                )
              )}
              onClickOutside={() => setIsProfilePopoverOpen(false)}
            >
              <button
                ref={profileButtonRef}
                onClick={() => setIsProfilePopoverOpen(!isProfilePopoverOpen)}
                className="relative flex items-center justify-center w-12 h-12 rounded-full bg-yellow-300/10 border border-yellow-300/40 hover:bg-yellow-300/20 transition-all shadow-md"
                aria-label="Profile"
              >
                {user && user.photoURL ? (
                  <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full" />
                ) : (
                  <UserIcon className="w-6 h-6 text-yellow-300" />
                )}
              </button>
            </PortalPopover>

            <div className="text-right">
              <div className="text-sm text-white/75">Today's Date</div>
              <div className="text-xl lg:text-2xl font-semibold text-yellow-300">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Top Bar - Simple */}
        <div className="md:hidden flex items-center justify-between mb-4 p-3 rounded-2xl border border-yellow-300/40 sticky top-0 z-30 bg-[#000000]/80 backdrop-blur-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">🐻</span>
            <h1 className="m-0 text-yellow-300 text-lg font-bold">Fitness Tracker</h1>
          </div>
          <div className="text-xs text-white/75">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Bottom Navigation - Mobile Only */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#000000]/95 backdrop-blur-lg border-t border-yellow-300/40 shadow-[0_-10px_30px_rgba(253,224,71,0.15)]">
          <div className="flex items-center justify-around px-2 py-2 max-w-screen-lg mx-auto">
            {/* Home Button */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all active:bg-yellow-300/10"
              aria-label="Home"
            >
              <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs text-yellow-300 font-medium">Home</span>
            </button>

            {/* Friends Button */}
            <PortalPopover
              isOpen={isFriendsPopoverOpen}
              positions={["top"]}
              content={() => (
                <div className="w-64 bg-slate-800 z-[999999] border border-yellow-300/30 rounded-xl shadow-lg p-4 backdrop-blur-sm mb-2">
                  <div className="text-yellow-300 font-semibold text-sm mb-2">Online Friends</div>
                  {onlineFriends.length === 0 && (
                    <div className="text-white/50 text-sm italic">No friends online</div>
                  )}
                  <ul className="space-y-2 max-h-64 overflow-y-auto">
                    {onlineFriends.map(friend => (
                      <li key={friend.id} className="flex items-center gap-3 text-white text-sm">
                        <div className="text-yellow-300">{friend.avatar}</div>
                        <div>
                          <div className="font-medium">{friend.name}</div>
                          <div className="text-xs text-white/50">Last: {friend.lastWorkout}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              onClickOutside={() => setIsFriendsPopoverOpen(false)}
            >
              <button
                ref={friendsButtonRef}
                onClick={() => setIsFriendsPopoverOpen(!isFriendsPopoverOpen)}
                className="relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all active:bg-yellow-300/10"
                aria-label="Friends"
              >
                <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-5a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-xs text-yellow-300 font-medium">Friends</span>
                {onlineFriendsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-300 text-blue-950 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-white shadow">{onlineFriendsCount}</span>
                )}
              </button>
            </PortalPopover>

            {/* Layout/Settings Button */}
            <button
              onClick={() => setShowLayoutConfigModal(true)}
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all active:bg-yellow-300/10"
              aria-label="Settings"
            >
              <Cog6ToothIcon className="w-6 h-6 text-yellow-300" />
              <span className="text-xs text-yellow-300 font-medium">Settings</span>
            </button>

            {/* Profile Button */}
            <PortalPopover
              isOpen={isProfilePopoverOpen}
              positions={["top"]}
              content={() => (
                user ? (
                  <div className="w-56 bg-slate-800 border border-yellow-300/30 rounded-xl shadow-lg p-4 backdrop-blur-sm text-sm z-[999999] mb-2">
                    <div className="flex items-center gap-3 mb-3">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full" />
                      ) : (
                        <UserIcon className="w-6 h-6 text-yellow-300" />
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-yellow-300 truncate">{user.displayName || user.email}</div>
                        <div className="text-white/60 truncate text-xs">{user.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setIsProfilePopoverOpen(false); signOut(); }}
                      className="w-full px-3 py-2 bg-yellow-300/10 hover:bg-yellow-300/20 rounded text-yellow-300 font-semibold transition-all"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="w-48 bg-slate-800 border border-yellow-300/30 rounded-xl shadow-lg p-4 backdrop-blur-sm text-sm text-center z-[999999] mb-2">
                    <button
                      onClick={() => { setIsProfilePopoverOpen(false); router.push('/auth'); }}
                      className="w-full px-3 py-2 bg-yellow-300/10 hover:bg-yellow-300/20 rounded text-yellow-300 font-semibold transition-all"
                    >
                      Sign In
                    </button>
                  </div>
                )
              )}
              onClickOutside={() => setIsProfilePopoverOpen(false)}
            >
              <button
                ref={profileButtonRef}
                onClick={() => setIsProfilePopoverOpen(!isProfilePopoverOpen)}
                className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all active:bg-yellow-300/10"
                aria-label="Profile"
              >
                {user && user.photoURL ? (
                  <img src={user.photoURL} alt="avatar" className="w-6 h-6 rounded-full" />
                ) : (
                  <UserIcon className="w-6 h-6 text-yellow-300" />
                )}
                <span className="text-xs text-yellow-300 font-medium">Profile</span>
              </button>
            </PortalPopover>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-3 md:px-4 pb-20 md:pb-4">
          {/* Main Grid Layout (Dynamic) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {layoutConfig.map((item) => {
              const spanClass = item.colSpan===3 ? 'md:col-span-3' : item.colSpan===2 ? 'md:col-span-2' : 'md:col-span-1';
              return <div key={item.key} className={spanClass}>
                {item.key === 'rsfSchedule' && <RsfScheduleCard />}
                {item.key === 'crowdMeter' && <CrowdMeterCard />}
                {item.key === 'achievements' && <AchievementsCard />}
                {item.key === 'workoutProgress' && <WorkoutProgressCard />}
                {item.key === 'workoutType' && <WorkoutTypeCard />}
                {item.key === 'weightProgress' && <WeightProgressCard />}
                {item.key === 'personalTimeline' && <PersonalTimelineCard />}
                {item.key === 'rsfOccupancy' && <RSFOccupancyAnalysis />}
                {item.key === 'progressGoals' && <ProgressGoalsCard />}
                {item.key === 'friends' && <FriendsCard />}
              </div>
            })}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {/* ... remove everything until friends/progress goals ... */}
          </div>

          {/* Progress Goals */}
          {/* ... remove static progress goals section ... */}

          {/* Friends */}
          {/* ... remove static friends section ... */}

          {/* Replace the old Google Calendar section with the new component */}
          <GoogleCalendarSection />

          {/* Enhanced Google Calendar Views */}


          {/* Motivational Banner */}
          <div className="bg-gradient-to-r from-yellow-400/10 via-yellow-300/5 to-transparent text-yellow-300 border border-yellow-300/20 p-6 md:p-8 rounded-xl text-center text-lg font-semibold mt-6 shadow-[0_0_25px_rgba(253,224,71,0.15)]">
            {motivationalMessage}
          </div>
        </div>
      </div>
      {showWeightModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div ref={weightModalRef} className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-800 border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-8 w-[480px] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-semibold text-yellow-300">Update Weight</h4>
                <button
                  onClick={() => setShowWeightModal(false)}
                  className="text-gray-400 hover:text-yellow-300 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/75 mb-1">
                    Current Weight (lbs)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter your current weight"
                    className="w-full px-4 py-3 bg-blue-950/50 border border-yellow-300/30 rounded-xl text-white text-sm transition-all focus:border-yellow-300 focus:outline-none placeholder:text-white/50"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/75 mb-1">
                    Goal Weight (lbs)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter your goal weight"
                    className="w-full px-4 py-3 bg-blue-950/50 border border-yellow-300/30 rounded-xl text-white text-sm transition-all focus:border-yellow-300 focus:outline-none placeholder:text-white/50"
                    value={newWeightGoal}
                    onChange={(e) => setNewWeightGoal(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-yellow-300/30">
                <button
                  className="px-6 py-3 text-white/75 hover:text-yellow-300 rounded-xl text-sm border border-yellow-300/20 min-w-0"
                  onClick={() => setShowWeightModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-3 bg-yellow-300 text-blue-950 rounded-xl text-sm font-semibold transition-all hover:bg-yellow-400"
                  onClick={updateWeight}
                >
                  Update Weight
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Log Workout Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div ref={logModalRef} className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-800 border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-8 w-[400px] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-semibold text-yellow-300">Log Workout</h4>
                <button onClick={() => setShowLogModal(false)} className="text-gray-400 hover:text-yellow-300 transition-colors">✕</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/75 mb-1">Workout Type</label>
                  <select
                    value={selectedWorkoutType}
                    onChange={(e) => setSelectedWorkoutType(e.target.value)}
                    className="w-full px-4 py-3 bg-blue-950/50 border border-yellow-300/30 rounded-xl text-white text-sm transition-all focus:border-yellow-300 focus:outline-none"
                  >
                    <option value="">Select workout type...</option>
                    <option value="arms">Arms</option>
                    <option value="legs">Legs</option>
                    <option value="back">Back</option>
                    <option value="core">Core</option>
                    <option value="chest">Chest</option>
                    <option value="flexibility">Flexibility</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-yellow-300/30">
                <button
                  className="px-6 py-3 text-white/75 hover:text-yellow-300 rounded-xl text-sm border border-yellow-300/20 min-w-0"
                  onClick={() => setShowLogModal(false)}
                >
                  Cancel
                </button>
                <button
                  disabled={!selectedWorkoutType}
                  className={`${selectedWorkoutType ? 'bg-yellow-300 text-blue-950 hover:bg-yellow-400' : 'bg-yellow-300/50 text-blue-950/50 cursor-not-allowed'} px-6 py-3 rounded-xl text-sm font-semibold transition-all`}
                  onClick={() => {
                    if (selectedWorkoutType) {
                      updateProgress(selectedWorkoutType);
                      setSelectedWorkoutType('');
                      setShowLogModal(false);
                    }
                  }}
                >
                  Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Adjust Goals Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div ref={goalModalRef} className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-800 border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-8 w-[480px] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-semibold text-yellow-300">Adjust Goals</h4>
                <button onClick={() => setShowGoalModal(false)} className="text-gray-400 hover:text-yellow-300 transition-colors">✕</button>
              </div>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {Object.keys(tempGoals).map((key) => (
                  <div key={key} className="flex items-center gap-4">
                    <label className="capitalize w-24 text-sm text-white/80">{key}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={(tempGoals as any)[key]}
                      onChange={(e) => setTempGoals((prev) => ({ ...prev, [key]: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) }))}
                      className="flex-1 px-3 py-2 bg-blue-950/50 border border-yellow-300/30 rounded-md text-sm text-white"
                    />
                    <span className="text-white/60 text-sm">%</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-yellow-300/30">
                <button
                  className="px-6 py-3 text-white/75 hover:text-yellow-300 rounded-xl text-sm border border-yellow-300/20 min-w-0"
                  onClick={() => setShowGoalModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-3 bg-yellow-300 text-blue-950 rounded-xl text-sm font-semibold transition-all hover:bg-yellow-400"
                  onClick={() => {
                    setWorkoutProgress(tempGoals);
                    setShowGoalModal(false);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Layout Config Modal */}
      {showLayoutConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div
            ref={layoutModalRef}
            className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-800 border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-8 w-[480px] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-semibold text-yellow-300">Customize Dashboard Layout</h4>
                <button onClick={() => setShowLayoutConfigModal(false)} className="text-gray-400 hover:text-yellow-300 transition-colors">✕</button>
              </div>
              <p className="text-white/70 mb-4 text-sm">Reorder your cards and set column widths. Columns max at 3, calendar views min at 2 columns.</p>
              {/* Placeholder for configuration UI */}
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {layoutConfig.map((item, idx) => (
                  <div key={item.key} className="flex items-center gap-3 bg-slate-800/40 border border-yellow-300/20 rounded-lg p-3">
                    <div className="flex-1 text-white text-sm font-medium">{item.title}</div>
                    <select
                      value={item.colSpan}
                      onChange={e => updateColSpan(item.key, Number(e.target.value) as 1|2|3)}
                      className="px-2 py-1 bg-slate-700/50 border border-yellow-300/20 rounded-md text-sm text-yellow-300 focus:outline-none"
                    >
                      {[1,2,3].map(v => (
                        <option key={v} value={v} disabled={!!(item.minColSpan && v < item.minColSpan)}>{v}</option>
                      ))}
                    </select>
                    <button
                      disabled={idx===0}
                      onClick={() => moveItem(idx,-1)}
                      className={`p-1 rounded-md ${idx===0 ? 'text-gray-500':'text-yellow-300 hover:bg-yellow-300/10'}`}
                    >
                      <ChevronUpIcon className="w-4 h-4" />
                    </button>
                    <button
                      disabled={idx===layoutConfig.length-1}
                      onClick={() => moveItem(idx,1)}
                      className={`p-1 rounded-md ${idx===layoutConfig.length-1 ? 'text-gray-500':'text-yellow-300 hover:bg-yellow-300/10'}`}
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-yellow-300/30">
                <button
                  className="px-6 py-3 text-white/75 hover:text-yellow-300 rounded-xl text-sm border border-yellow-300/20 min-w-0"
                  onClick={() => setShowLayoutConfigModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-3 bg-yellow-300 text-blue-950 rounded-xl text-sm font-semibold transition-all hover:bg-yellow-400"
                  onClick={() => {
                    console.log('✅ Apply layoutConfig', layoutConfig);
                    setShowLayoutConfigModal(false);
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DndProvider>
  );
};

export default FitnessDashboard;
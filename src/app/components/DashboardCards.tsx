'use client'

import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { UserIcon, TrophyIcon, BoltIcon, FireIcon } from '@heroicons/react/24/outline';

// RSF Class Schedule Card
export const RSFClassScheduleCard: React.FC<{
  generateCalendarDays: () => any[];
  CalendarDay: React.ComponentType<any>;
}> = ({ generateCalendarDays, CalendarDay }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-yellow-300 mb-1 text-xl font-semibold">RSF Class Schedule</h3>
          <p className="text-sm text-white/75">Browse and join group fitness classes</p>
        </div>
      </div>
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {generateCalendarDays().map(day => (
            <div key={day.date} className="w-64 flex-shrink-0">
              <CalendarDay {...day} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// RSF Crowd Meter Card
export const RSFCrowdMeterCard: React.FC<{
  selectedMeter: 'RSF' | 'CMS';
  setSelectedMeter: (meter: 'RSF' | 'CMS') => void;
  percentFull: number | null;
  METER_CONFIG: any;
}> = ({ selectedMeter, setSelectedMeter, percentFull, METER_CONFIG }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-yellow-300 text-xl font-bold m-0">
          {METER_CONFIG[selectedMeter].displayName} Crowd Meter
        </h3>
        <div className="flex gap-2">
          {Object.keys(METER_CONFIG).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedMeter(key as 'RSF' | 'CMS')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border shadow-sm ${
                selectedMeter === key
                  ? 'bg-yellow-300 text-blue-950 border-yellow-300'
                  : 'bg-slate-700/50 text-yellow-300 border-yellow-300/30 hover:bg-yellow-300/10'
              }`}
            >
              {METER_CONFIG[key].displayName}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#1e293b"
              strokeWidth="12"
            />
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
  );
};

// Personal Timeline Card
export const PersonalTimelineCard: React.FC<{
  PersonalTimeline: React.ComponentType<any>;
  personalEvents: any[];
  setPersonalEvents: (events: any[]) => void;
  combinedEvents: any[];
  isGCalAuthenticated: boolean;
  selectedCalendar: any;
  googleEvents: any[];
}> = ({ PersonalTimeline, personalEvents, setPersonalEvents, combinedEvents, isGCalAuthenticated, selectedCalendar, googleEvents }) => {
  return (
    <div className="h-full">
      <PersonalTimeline 
        personalEvents={personalEvents} 
        setPersonalEvents={setPersonalEvents} 
        combinedEvents={combinedEvents}
        isGCalAuthenticated={isGCalAuthenticated}
        selectedCalendar={selectedCalendar}
        googleEvents={googleEvents}
      />
    </div>
  );
};

// Achievements Card
export const AchievementsCard: React.FC<{
  achievements: any[];
  setShowLogModal: (show: boolean) => void;
}> = ({ achievements, setShowLogModal }) => {
  return (
    <div className="h-full flex flex-col">
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
      <div className="flex-1 flex flex-wrap gap-2">
        {achievements.map(achievement => (
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
  );
};

// Workout Progress Card
export const WorkoutProgressCard: React.FC<{
  timeScale: '7d' | '14d' | '30d';
  setTimeScale: (scale: '7d' | '14d' | '30d') => void;
  consistencyChartData: any;
  lineChartOptions: any;
}> = ({ timeScale, setTimeScale, consistencyChartData, lineChartOptions }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-yellow-300 text-xl font-bold">Workout Progress</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeScale('7d')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              timeScale === '7d' 
                ? 'bg-yellow-300 text-blue-950' 
                : 'bg-blue-900/50 text-white hover:bg-blue-900/70'
            }`}
          >
            7D
          </button>
          <button
            onClick={() => setTimeScale('14d')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              timeScale === '14d' 
                ? 'bg-yellow-300 text-blue-950' 
                : 'bg-blue-900/50 text-white hover:bg-blue-900/70'
            }`}
          >
            14D
          </button>
          <button
            onClick={() => setTimeScale('30d')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              timeScale === '30d' 
                ? 'bg-yellow-300 text-blue-950' 
                : 'bg-blue-900/50 text-white hover:bg-blue-900/70'
            }`}
          >
            30D
          </button>
        </div>
      </div>
      <div className="flex-1">
        <Line data={consistencyChartData} options={lineChartOptions} />
      </div>
    </div>
  );
};

// Workout Type Distribution Card
export const WorkoutTypeDistributionCard: React.FC<{
  workoutTypeData: any;
  workoutTypeOptions: any;
}> = ({ workoutTypeData, workoutTypeOptions }) => {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-yellow-300 text-xl font-bold mb-4">Workout Type Distribution</h3>
      <div className="flex-1">
        <Doughnut data={workoutTypeData} options={workoutTypeOptions} />
      </div>
    </div>
  );
};

// Weight Progress Card
export const WeightProgressCard: React.FC<{
  weightChartData: any;
  weightChartOptions: any;
  setShowWeightModal: (show: boolean) => void;
}> = ({ weightChartData, weightChartOptions, setShowWeightModal }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-yellow-300 text-xl font-bold">Weight Progress</h3>
        <button
          onClick={() => setShowWeightModal(true)}
          className="px-4 py-2 bg-yellow-300 text-blue-950 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition-all"
        >
          Update Weight
        </button>
      </div>
      <div className="flex-1">
        <Line data={weightChartData} options={weightChartOptions} />
      </div>
    </div>
  );
};

// Progress Goals Card
export const ProgressGoalsCard: React.FC<{
  workoutProgress: Record<string, number>;
  workoutData: any[];
  setShowGoalModal: (show: boolean) => void;
}> = ({ workoutProgress, workoutData, setShowGoalModal }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-yellow-300 text-xl font-bold">Progress Goals</h3>
        <button
          onClick={() => setShowGoalModal(true)}
          className="px-4 py-2 bg-yellow-300 text-blue-950 rounded-lg text-sm font-semibold hover:bg-yellow-400"
        >
          Adjust Goals
        </button>
      </div>
      <div className="flex-1 flex flex-col gap-3">
        {Object.entries(workoutProgress).map(([type, progress]: [string, number]) => {
          const color = '#FDB515';
          const workoutCount = workoutData.filter(w => w.completed && w.type === type).length;
          return (
            <div key={type} className="flex items-center gap-3">
              <div className="w-24 capitalize text-white" style={{ color }}>{type}</div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/75">{workoutCount} workouts completed</span>
                  <span className="font-medium text-white">{progress}%</span>
                </div>
                <div className="h-2 bg-blue-900/50 rounded-full overflow-hidden">
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
    </div>
  );
};

// Gym Friends Card
export const GymFriendsCard: React.FC<{
  filteredFriends: any[];
  searchFriends: string;
  setSearchFriends: (search: string) => void;
  addFriendEmail: string;
  setAddFriendEmail: (email: string) => void;
  handleAddFriend: () => void;
  addFriendError: string;
}> = ({ filteredFriends, searchFriends, setSearchFriends, addFriendEmail, setAddFriendEmail, handleAddFriend, addFriendError }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h3 className="text-yellow-300 text-xl font-bold">Gym Friends</h3>
        <div className="flex gap-2 flex-wrap w-full md:w-auto">
          <div className="relative w-full md:flex-1">
            <input
              type="text"
              placeholder="Search friends..."
              value={searchFriends}
              onChange={(e) => setSearchFriends(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-blue-900/50 border-2 border-yellow-300/30 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:border-yellow-300/50"
            />
            <svg className="w-5 h-5 text-yellow-300/50 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="email"
            className="w-full md:w-auto px-4 py-2 bg-blue-900/50 border-2 border-yellow-300/30 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:border-yellow-300/50"
            placeholder="Friend's email"
            value={addFriendEmail}
            onChange={e => { setAddFriendEmail(e.target.value); }}
          />
          <button
            onClick={handleAddFriend}
            className="w-full md:w-auto px-4 py-2 bg-yellow-300 text-blue-950 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition-all md:whitespace-nowrap"
          >
            Add Friend
          </button>
          {addFriendError && <span className="text-red-400 text-xs ml-2">{addFriendError}</span>}
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
        {filteredFriends.map(friend => (
          <div key={friend.id} className="flex items-center gap-3 p-3 bg-blue-900/30 rounded-lg border border-yellow-300/20 hover:border-yellow-300/50 hover:bg-blue-900/50 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
            <div className="text-yellow-300">{friend.avatar}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{friend.name}</span>
                <span className={`w-2 h-2 rounded-full ${friend.isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
              </div>
              <div className="text-sm text-white">
                Last workout: {friend.lastWorkout}
              </div>
            </div>
            <div className="text-sm text-white">
              {friend.workoutCount} workouts
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Google Calendar Card
export const GoogleCalendarCard: React.FC<{
  GoogleCalendarSection: React.ComponentType<any>;
}> = ({ GoogleCalendarSection }) => {
  return (
    <div className="h-full">
      <GoogleCalendarSection />
    </div>
  );
};

// Google Calendar Views Card
export const GoogleCalendarViewsCard: React.FC<{
  GoogleCalendarViews: React.ComponentType<any>;
  personalEvents: any[];
  setPersonalEvents: (events: any[]) => void;
  combinedEvents: any[];
}> = ({ GoogleCalendarViews, personalEvents, setPersonalEvents, combinedEvents }) => {
  return (
    <div className="h-full">
      <GoogleCalendarViews 
        personalEvents={personalEvents}
        setPersonalEvents={setPersonalEvents}
        combinedEvents={combinedEvents}
      />
    </div>
  );
}; 
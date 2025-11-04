import React from 'react';
import { PersonalTimeline } from './PersonalTimeline';

interface PersonalTimelineCardProps {
  user: any;
  personalEvents: any[];
  setPersonalEvents: (events: any[]) => void;
  combinedEvents: any[];
  isGCalAuthenticated: boolean;
  selectedCalendar: any;
  googleEvents: any[];
  authenticateGCal: () => void;
  isGCalLoading: boolean;
  router: any;
}

const PersonalTimelineCard: React.FC<PersonalTimelineCardProps> = ({
  user,
  personalEvents,
  setPersonalEvents,
  combinedEvents,
  isGCalAuthenticated,
  selectedCalendar,
  googleEvents,
  authenticateGCal,
  isGCalLoading,
  router
}) => {
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

export default PersonalTimelineCard; 
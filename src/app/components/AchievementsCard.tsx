import React from 'react';
import { BoltIcon, FireIcon, TrophyIcon } from '@heroicons/react/24/outline';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  unlocked: boolean;
  unlockedDate?: string;
}

interface AchievementsCardProps {
  achievements: Achievement[];
  onLogWorkout: () => void;
}

const AchievementsCard: React.FC<AchievementsCardProps> = ({ achievements, onLogWorkout }) => (
  <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-tr from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-yellow-300 text-xl font-bold">Achievements</h3>
        <div className="flex gap-2 items-center">
          <button
            onClick={onLogWorkout}
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

export default AchievementsCard; 
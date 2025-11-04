'use client'

import React, { useState, useCallback } from 'react';
import {
  HomeIcon,
  CalendarIcon,
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

type NavKey = 'home' | 'schedule' | 'crowd' | 'analysis' | 'friends';

const navItems: Array<{
  key: NavKey;
  label: string;
  icon: React.ReactNode;
  targetId?: string;
}> = [
  { key: 'home', label: 'Home', icon: <HomeIcon className="w-6 h-6" /> },
  { key: 'schedule', label: 'Schedule', icon: <CalendarIcon className="w-6 h-6" />, targetId: 'card-rsfSchedule' },
  { key: 'crowd', label: 'Crowd', icon: <ChartBarIcon className="w-6 h-6" />, targetId: 'card-crowdMeter' },
  { key: 'analysis', label: 'Analysis', icon: <ChartBarIcon className="w-6 h-6" />, targetId: 'card-rsfAnalysis' },
  { key: 'friends', label: 'Friends', icon: <UsersIcon className="w-6 h-6" />, targetId: 'card-friends' },
];

export const MobileBottomNav: React.FC = () => {
  const [active, setActive] = useState<NavKey>('home');

  const handleClick = useCallback((key: NavKey, targetId?: string) => {
    setActive(key);
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-[1000]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto max-w-6xl px-2">
        <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.06),0_0_25px_rgba(253,224,71,0.1)] rounded-t-2xl overflow-hidden">
          <div className="grid grid-cols-5">
            {navItems.map(item => {
              const isActive = active === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleClick(item.key, item.targetId)}
                  className={`flex flex-col items-center justify-center py-3 text-xs transition-colors ${
                    isActive ? 'text-yellow-300' : 'text-white/70 hover:text-yellow-300'
                  }`}
                >
                  <div className={`mb-1 ${isActive ? 'text-yellow-300' : ''}`}>{item.icon}</div>
                  <span className="leading-none">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MobileBottomNav;



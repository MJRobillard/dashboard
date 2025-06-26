import React from 'react';
import { MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';

export interface GymFriend {
  id: string;
  name: string;
  email: string;
  avatar: JSX.Element;
  lastWorkout?: string;
  nextWorkout?: string;
  workoutCount: number;
  isOnline: boolean;
}

interface FriendsCardProps {
  gymFriends: GymFriend[];
  searchFriends: string;
  setSearchFriends: (v: string) => void;
  addFriendEmail: string;
  setAddFriendEmail: (v: string) => void;
  addFriendError: string;
  setAddFriendError: (v: string) => void;
  handleAddFriend: () => void;
  user: any;
  router: any;
}

const FriendsCard: React.FC<FriendsCardProps> = ({
  gymFriends,
  searchFriends,
  setSearchFriends,
  addFriendEmail,
  setAddFriendEmail,
  addFriendError,
  setAddFriendError,
  handleAddFriend,
  user,
  router
}) => {
  const filteredFriends = gymFriends.filter(friend => 
    friend.name.toLowerCase().includes(searchFriends.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchFriends.toLowerCase())
  );

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
    <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h3 className="text-yellow-300 text-xl font-bold">Gym Friends</h3>
        <div className="flex gap-2 flex-wrap w-full md:w-auto">
          <div className="relative w-full md:flex-1">
            <input type="text" placeholder="Search friends..." value={searchFriends} onChange={e=>setSearchFriends(e.target.value)} className="w-full px-4 py-2 pl-10 bg-blue-900/50 border-2 border-yellow-300/30 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:border-yellow-300/50" />
            <MagnifyingGlassIcon className="w-5 h-5 text-yellow-300/50 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <input type="email" className="w-full md:w-auto px-4 py-2 bg-blue-900/50 border-2 border-yellow-300/30 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:border-yellow-300/50" placeholder="Friend's email" value={addFriendEmail} onChange={e=>{setAddFriendEmail(e.target.value); setAddFriendError('');}} />
          <button onClick={handleAddFriend} className="w-full md:w-auto px-4 py-2 bg-yellow-300 text-blue-950 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition-all">Add Friend</button>
        </div>
      </div>
      <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
        {filteredFriends.map(friend => (
          <div key={friend.id} className="flex items-center gap-3 p-3 bg-blue-900/30 rounded-lg border border-yellow-300/20">
            <div className="text-yellow-300">{friend.avatar}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2"><span className="font-medium text-white">{friend.name}</span><span className={`w-2 h-2 rounded-full ${friend.isOnline?'bg-green-400':'bg-gray-400'}`} /></div>
              <div className="text-sm text-white">Last workout: {friend.lastWorkout}</div>
            </div>
            <div className="text-sm text-white">{friend.workoutCount} workouts</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsCard; 
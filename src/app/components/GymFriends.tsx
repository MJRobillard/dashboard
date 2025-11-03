'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserIcon, 
  BoltIcon, 
  FireIcon, 
  UserPlusIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
  CheckIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { 
  createUserProfile, 
  getUserProfile, 
  searchUsers, 
  sendFriendRequest, 
  getFriendRequests, 
  acceptFriendRequest, 
  getFriends, 
  shareWorkout, 
  getFriendsWorkouts,
  subscribeToFriendsOnlineStatus,
  updateUserOnlineStatus,
  UserProfile,
  FriendRequest,
  SharedWorkout
} from '../utils/firebase';
import { useFirebase } from '../contexts/FirebaseContext';

interface GymFriendsProps {
  workoutData: any[];
  onWorkoutShared?: () => void;
}

export const GymFriends: React.FC<GymFriendsProps> = ({ workoutData, onWorkoutShared }) => {
  const { user } = useFirebase();
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friendsWorkouts, setFriendsWorkouts] = useState<SharedWorkout[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [showWorkoutFeed, setShowWorkoutFeed] = useState(false);
  const [onlineFriends, setOnlineFriends] = useState<UserProfile[]>([]);

  // Load user profile on first login
  useEffect(() => {
    if (user) {
      const initializeUserProfile = async () => {
        const profile = await getUserProfile(user.uid);
        if (!profile) {
          await createUserProfile(user);
        }
        // Set user as online
        await updateUserOnlineStatus(user.uid, true);
      };
      initializeUserProfile();
    }
  }, [user]);

  // Load friends and requests
  useEffect(() => {
    if (user) {
      const loadFriendsData = async () => {
        const [friendsList, requests] = await Promise.all([
          getFriends(user.uid),
          getFriendRequests(user.uid)
        ]);
        setFriends(friendsList);
        setFriendRequests(requests);
      };
      loadFriendsData();
    }
  }, [user]);

  // Subscribe to real-time online status
  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToFriendsOnlineStatus(user.uid, (onlineFriendsList) => {
        setOnlineFriends(onlineFriendsList);
      });

      return () => unsubscribe();
    }
  }, [user]);

  // Search users
  const handleSearch = async () => {
    if (!searchTerm.trim() || !user) return;
    
    setIsSearching(true);
    try {
      const results = await searchUsers(searchTerm, user.uid);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Send friend request
  const handleSendFriendRequest = async (toUserId: string) => {
    if (!user) return;
    
    const success = await sendFriendRequest(user.uid, toUserId);
    if (success) {
      // Remove from search results
      setSearchResults(prev => prev.filter(result => result.uid !== toUserId));
      setSearchTerm('');
    }
  };

  // Accept friend request
  const handleAcceptRequest = async (requestId: string) => {
    if (!user) return;
    
    const success = await acceptFriendRequest(requestId);
    if (success) {
      // Reload friends and requests
      const [friendsList, requests] = await Promise.all([
        getFriends(user.uid),
        getFriendRequests(user.uid)
      ]);
      setFriends(friendsList);
      setFriendRequests(requests);
    }
  };

  // Share workout
  const handleShareWorkout = async (workout: any) => {
    if (!user) return;
    
    const success = await shareWorkout(workout, user.uid);
    if (success) {
      onWorkoutShared?.();
      // Reload friends workouts
      const workouts = await getFriendsWorkouts(user.uid);
      setFriendsWorkouts(workouts);
    }
  };

  // Load friends workouts
  useEffect(() => {
    if (user && showWorkoutFeed) {
      const loadWorkouts = async () => {
        const workouts = await getFriendsWorkouts(user.uid);
        setFriendsWorkouts(workouts);
      };
      loadWorkouts();
    }
  }, [user, showWorkoutFeed]);

  const filteredFriends = useMemo(() => {
    return friends.filter(friend => 
      friend.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [friends, searchTerm]);

  const formatLastWorkout = (timestamp: any) => {
    if (!timestamp) return 'Never';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  if (!user) {
    return (
      <div className="bg-gradient-to-br from-[#000000] via-[#0b1939] to-[#000000] border border-yellow-300/30 shadow-[inset_0_0_15px_rgba(253,224,71,0.05),0_0_25px_rgba(253,224,71,0.1)] rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-300/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 text-center py-8">
          <h3 className="text-yellow-300 text-xl font-bold mb-4">Gym Friends</h3>
          <p className="text-white/75 mb-6">Sign in to connect with friends and track your social fitness journey</p>
          <button className="px-6 py-3 bg-yellow-300 text-blue-950 rounded-xl text-sm font-semibold transition-all hover:bg-yellow-400">
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
            <input 
              type="text" 
              placeholder="Search friends..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-blue-900/50 border-2 border-yellow-300/30 rounded-lg text-sm text-white placeholder-white/50 focus:outline-none focus:border-yellow-300/50" 
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-yellow-300/50 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full md:w-auto px-4 py-2 bg-yellow-300 text-blue-950 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition-all disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-yellow-300 font-semibold">Friend Requests ({friendRequests.length})</h4>
            <button 
              onClick={() => setShowFriendRequests(!showFriendRequests)}
              className="text-yellow-300/75 hover:text-yellow-300"
            >
              {showFriendRequests ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </div>
          {showFriendRequests && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {friendRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-blue-900/30 rounded-lg border border-yellow-300/20">
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-6 h-6 text-yellow-300" />
                    <div>
                      <div className="font-medium text-white">{request.fromUserId}</div>
                      <div className="text-sm text-white/60">{request.message || 'Wants to be your gym buddy!'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcceptRequest(request.id)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-4">
          <h4 className="text-yellow-300 font-semibold mb-2">Search Results</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {searchResults.map(user => (
              <div key={user.uid} className="flex items-center justify-between p-3 bg-blue-900/30 rounded-lg border border-yellow-300/20">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="avatar" className="w-6 h-6 rounded-full" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-yellow-300" />
                  )}
                  <div>
                    <div className="font-medium text-white">{user.displayName}</div>
                    <div className="text-sm text-white/60">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleSendFriendRequest(user.uid)}
                  className="px-3 py-1 bg-yellow-300/20 hover:bg-yellow-300/30 text-yellow-300 rounded text-sm transition-colors border border-yellow-300/30"
                >
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-yellow-300 font-semibold">Your Friends ({friends.length})</h4>
          <button 
            onClick={() => setShowWorkoutFeed(!showWorkoutFeed)}
            className="text-yellow-300/75 hover:text-yellow-300 text-sm"
          >
            {showWorkoutFeed ? 'Hide' : 'Show'} Workout Feed
          </button>
        </div>
        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
          {filteredFriends.map(friend => (
            <div key={friend.uid} className="flex items-center gap-3 p-3 bg-blue-900/30 rounded-lg border border-yellow-300/20">
              <div className="text-yellow-300">
                {friend.photoURL ? (
                  <img src={friend.photoURL} alt="avatar" className="w-6 h-6 rounded-full" />
                ) : (
                  <UserIcon className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{friend.displayName}</span>
                  <span className={`w-2 h-2 rounded-full ${friend.isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
                </div>
                <div className="text-sm text-white">
                  Last workout: {formatLastWorkout(friend.workoutStats.lastWorkoutDate)}
                </div>
              </div>
              <div className="text-sm text-white">{friend.workoutStats.totalWorkouts} workouts</div>
            </div>
          ))}
        </div>
      </div>

      {/* Friends Workout Feed */}
      {showWorkoutFeed && (
        <div className="mt-4">
          <h4 className="text-yellow-300 font-semibold mb-2">Recent Friend Workouts</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {friendsWorkouts.length > 0 ? (
              friendsWorkouts.map(workout => (
                <div key={workout.id} className="p-3 bg-green-900/20 rounded-lg border border-green-300/20">
                  <div className="flex items-center gap-2 mb-1">
                    <FireIcon className="w-4 h-4 text-green-300" />
                    <span className="font-medium text-white">{workout.workoutType}</span>
                    <span className="text-sm text-white/60">by {workout.userId}</span>
                  </div>
                  <div className="text-sm text-white/75">
                    {new Date(workout.date).toLocaleDateString()} - {workout.completed ? 'Completed' : 'Planned'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-white/50 py-4">No recent friend workouts</div>
            )}
          </div>
        </div>
      )}

      {/* Share Your Workout */}
      {workoutData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-yellow-300/20">
          <h4 className="text-yellow-300 font-semibold mb-2">Share Your Latest Workout</h4>
          <div className="space-y-2">
            {workoutData.slice(-3).reverse().map((workout, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg border border-blue-300/20">
                <div>
                  <div className="font-medium text-white">{workout.type} workout</div>
                  <div className="text-sm text-white/60">{workout.date}</div>
                </div>
                <button
                  onClick={() => handleShareWorkout(workout)}
                  className="px-3 py-1 bg-yellow-300/20 hover:bg-yellow-300/30 text-yellow-300 rounded text-sm transition-colors border border-yellow-300/30"
                >
                  Share
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 
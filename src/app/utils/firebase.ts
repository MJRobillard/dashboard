import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, startAfter, deleteDoc, updateDoc, addDoc, Timestamp, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize analytics only on client side
let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then(yes => yes && (analytics = getAnalytics(app)));
}

// 🔥 Gym Friends - Firestore Collections
export const COLLECTIONS = {
  USERS: 'users',
  FRIENDSHIPS: 'friendships',
  FRIEND_REQUESTS: 'friendRequests',
  WORKOUTS: 'workouts',
  USER_PROFILES: 'userProfiles'
} as const;

// 🔥 Gym Friends - Data Types
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isOnline: boolean;
  lastSeen: Timestamp;
  privacySettings: {
    showWorkouts: boolean;
    showOnlineStatus: boolean;
    allowFriendRequests: boolean;
  };
  workoutStats: {
    totalWorkouts: number;
    lastWorkoutDate?: Timestamp;
    nextWorkoutDate?: Timestamp;
    favoriteWorkoutType?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Friendship {
  id: string;
  user1Id: string;
  user2Id: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SharedWorkout {
  id: string;
  userId: string;
  workoutType: string;
  completed: boolean;
  date: string;
  weight?: number;
  notes?: string;
  isPublic: boolean;
  createdAt: Timestamp;
}

// 🔥 Gym Friends - Helper Functions
export const createUserProfile = async (user: any): Promise<void> => {
  try {
    const userProfile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      photoURL: user.photoURL || undefined,
      isOnline: true,
      lastSeen: Timestamp.now(),
      privacySettings: {
        showWorkouts: true,
        showOnlineStatus: true,
        allowFriendRequests: true,
      },
      workoutStats: {
        totalWorkouts: 0,
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, COLLECTIONS.USER_PROFILES, user.uid), userProfile);
    console.log('✅ User profile created:', userProfile.displayName);
  } catch (error) {
    console.error('❌ Error creating user profile:', error);
  }
};

export const updateUserOnlineStatus = async (uid: string, isOnline: boolean): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.USER_PROFILES, uid), {
      isOnline,
      lastSeen: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('❌ Error updating online status:', error);
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.USER_PROFILES, uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting user profile:', error);
    return null;
  }
};

export const searchUsers = async (searchTerm: string, currentUserId: string): Promise<UserProfile[]> => {
  try {
    const usersRef = collection(db, COLLECTIONS.USER_PROFILES);
    const q = query(
      usersRef,
      where('displayName', '>=', searchTerm),
      where('displayName', '<=', searchTerm + '\uf8ff'),
      where('uid', '!=', currentUserId),
      where('privacySettings.allowFriendRequests', '==', true),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
  } catch (error) {
    console.error('❌ Error searching users:', error);
    return [];
  }
};

export const sendFriendRequest = async (fromUserId: string, toUserId: string, message?: string): Promise<boolean> => {
  try {
    const friendRequest: FriendRequest = {
      id: `${fromUserId}_${toUserId}`,
      fromUserId,
      toUserId,
      status: 'pending',
      message,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, COLLECTIONS.FRIEND_REQUESTS, friendRequest.id), friendRequest);
    console.log('✅ Friend request sent');
    return true;
  } catch (error) {
    console.error('❌ Error sending friend request:', error);
    return false;
  }
};

export const getFriendRequests = async (userId: string): Promise<FriendRequest[]> => {
  try {
    const requestsRef = collection(db, COLLECTIONS.FRIEND_REQUESTS);
    const q = query(
      requestsRef,
      where('toUserId', '==', userId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as FriendRequest);
  } catch (error) {
    console.error('❌ Error getting friend requests:', error);
    return [];
  }
};

export const acceptFriendRequest = async (requestId: string): Promise<boolean> => {
  try {
    const requestRef = doc(db, COLLECTIONS.FRIEND_REQUESTS, requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (!requestSnap.exists()) return false;
    
    const request = requestSnap.data() as FriendRequest;
    
    // Update request status
    await updateDoc(requestRef, {
      status: 'accepted',
      updatedAt: Timestamp.now(),
    });
    
    // Create friendship
    const friendship: Friendship = {
      id: `${request.fromUserId}_${request.toUserId}`,
      user1Id: request.fromUserId,
      user2Id: request.toUserId,
      status: 'accepted',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    await setDoc(doc(db, COLLECTIONS.FRIENDSHIPS, friendship.id), friendship);
    console.log('✅ Friend request accepted');
    return true;
  } catch (error) {
    console.error('❌ Error accepting friend request:', error);
    return false;
  }
};

export const getFriends = async (userId: string): Promise<UserProfile[]> => {
  try {
    const friendshipsRef = collection(db, COLLECTIONS.FRIENDSHIPS);
    const q = query(
      friendshipsRef,
      where('user1Id', '==', userId),
      where('status', '==', 'accepted')
    );
    
    const querySnapshot = await getDocs(q);
    const friendIds = querySnapshot.docs.map(doc => {
      const friendship = doc.data() as Friendship;
      return friendship.user2Id;
    });
    
    // Get friend profiles
    const friendProfiles: UserProfile[] = [];
    for (const friendId of friendIds) {
      const profile = await getUserProfile(friendId);
      if (profile) {
        friendProfiles.push(profile);
      }
    }
    
    return friendProfiles;
  } catch (error) {
    console.error('❌ Error getting friends:', error);
    return [];
  }
};

export const shareWorkout = async (workout: any, userId: string): Promise<boolean> => {
  try {
    const sharedWorkout: SharedWorkout = {
      id: `${userId}_${Date.now()}`,
      userId,
      workoutType: workout.type,
      completed: workout.completed,
      date: workout.date,
      weight: workout.weight,
      notes: workout.notes,
      isPublic: true,
      createdAt: Timestamp.now(),
    };
    
    await addDoc(collection(db, COLLECTIONS.WORKOUTS), sharedWorkout);
    
    // Update user's workout stats
    const userProfile = await getUserProfile(userId);
    if (userProfile) {
      await updateDoc(doc(db, COLLECTIONS.USER_PROFILES, userId), {
        'workoutStats.totalWorkouts': userProfile.workoutStats.totalWorkouts + 1,
        'workoutStats.lastWorkoutDate': Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
    
    console.log('✅ Workout shared');
    return true;
  } catch (error) {
    console.error('❌ Error sharing workout:', error);
    return false;
  }
};

export const getFriendsWorkouts = async (userId: string, limitCount: number = 10): Promise<SharedWorkout[]> => {
  try {
    const friends = await getFriends(userId);
    const friendIds = friends.map(friend => friend.uid);
    
    if (friendIds.length === 0) return [];
    
    const workoutsRef = collection(db, COLLECTIONS.WORKOUTS);
    const q = query(
      workoutsRef,
      where('userId', 'in', friendIds),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as SharedWorkout);
  } catch (error) {
    console.error('❌ Error getting friends workouts:', error);
    return [];
  }
};

// Real-time listeners for online status
export const subscribeToFriendsOnlineStatus = (
  userId: string,
  callback: (friends: UserProfile[]) => void
): Unsubscribe => {
  const friendsRef = collection(db, COLLECTIONS.USER_PROFILES);
  const q = query(friendsRef, where('uid', '!=', userId));
  
  return onSnapshot(q, (snapshot) => {
    const friends: UserProfile[] = [];
    snapshot.forEach((doc) => {
      const profile = doc.data() as UserProfile;
      if (profile.isOnline) {
        friends.push(profile);
      }
    });
    callback(friends);
  });
};

export { app, auth, db, storage, analytics }; 
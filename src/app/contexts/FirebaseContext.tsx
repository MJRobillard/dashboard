"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        // Set auth cookie when user is logged in
        Cookies.set('auth', 'true', { expires: 7 }); // Expires in 7 days
      } else {
        // Remove auth cookie when user is logged out
        Cookies.remove('auth');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <FirebaseContext.Provider value={{ user, loading, signOut: handleSignOut }}>
      {!loading && children}
    </FirebaseContext.Provider>
  );
}; 
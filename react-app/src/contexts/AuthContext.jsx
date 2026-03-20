import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getStreakTier(streak) {
  if (streak >= 365) return 'Legendary';
  if (streak >= 100) return 'Centurion';
  if (streak >= 50) return 'Half Century';
  if (streak >= 30) return 'Monthly Master';
  if (streak >= 14) return 'Consistent';
  if (streak >= 7) return 'Week Warrior';
  if (streak >= 3) return 'Getting Started';
  return 'Newcomer';
}

function parseFirebaseError(code) {
  const map = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

function enrichUser(profile) {
  if (!profile) return null;
  return {
    ...profile,
    streakTier: getStreakTier(profile.currentStreak || 0),
    joinedAt: profile.joinedAt?.toDate?.() ?? profile.joinedAt ?? new Date(),
    lastCompletionDate: profile.lastCompletionDate?.toDate?.() ?? profile.lastCompletionDate ?? null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(enrichUser({ uid: firebaseUser.uid, ...userDoc.data() }));
        } else {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'User',
            avatarColor: '#6C63FF',
            currentStreak: 0,
            longestStreak: 0,
            totalTasksCompleted: 0,
            joinedAt: new Date(),
            streakTier: 'Newcomer',
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        setUser(enrichUser({ uid: snap.id, ...snap.data() }));
      }
    });
    return unsub;
  }, [user?.uid]);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err) {
      setError(parseFirebaseError(err.code));
      return false;
    }
  }, []);

  const register = useCallback(async (email, password, displayName) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });

      const profile = {
        uid: cred.user.uid,
        email,
        displayName,
        avatarColor: '#6C63FF',
        currentStreak: 0,
        longestStreak: 0,
        lastCompletionDate: null,
        totalTasksCompleted: 0,
        joinedAt: Timestamp.now(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), profile);
      return true;
    } catch (err) {
      setError(parseFirebaseError(err.code));
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    loading,
    error,
    isLoggedIn: user !== null,
    login,
    register,
    logout,
    clearError,
    getStreakTier,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

const DEMO_USER = {
  uid: 'demo-user',
  email: 'demo@alignapp.com',
  displayName: 'Demo User',
  avatarColor: '#6C63FF',
  currentStreak: 5,
  longestStreak: 12,
  lastCompletionDate: null,
  totalTasksCompleted: 23,
  joinedAt: new Date(2025, 5, 1),
};

function getStreakTier(streak) {
  if (streak >= 365) return 'Legendary';
  if (streak >= 100) return 'Centurion';
  if (streak >= 50) return 'Half Century';
  if (streak >= 30) return 'Monthly Master';
  if (streak >= 14) return 'Consistent';
  if (streak >= 7) return 'Week Warrior';
  if (streak >= 3) return 'Getting Started';
  return 'Newcomer';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ ...DEMO_USER, streakTier: getStreakTier(DEMO_USER.currentStreak) });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logout = useCallback(() => setUser(null), []);
  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    loading,
    error,
    isLoggedIn: user !== null,
    logout,
    clearError,
    getStreakTier,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

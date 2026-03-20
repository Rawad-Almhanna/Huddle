import { useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import StreakDisplay from '../components/StreakDisplay';
import './Profile.css';

const BADGES = [
  { label: 'Getting Started', days: 3, icon: '⚡', color: '#60A5FA' },
  { label: 'Week Warrior', days: 7, icon: '🔥', color: '#F97316' },
  { label: 'Consistent', days: 14, icon: '📈', color: '#8B5CF6' },
  { label: 'Monthly Master', days: 30, icon: '🏅', color: '#F59E0B' },
  { label: 'Half Century', days: 50, icon: '🎖', color: '#EC4899' },
  { label: 'Centurion', days: 100, icon: '🛡', color: '#EF4444' },
  { label: 'Legendary', days: 365, icon: '💎', color: '#14B8A6' },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  if (!user) return null;

  const longestStreak = user.longestStreak || 0;

  return (
    <div className="profile-page">
      <div className="profile-page__avatar" style={{ background: `${user.avatarColor || '#6C63FF'}33` }}>
        <span style={{ color: user.avatarColor || '#6C63FF' }}>
          {user.displayName?.[0]?.toUpperCase() || '?'}
        </span>
      </div>
      <h1 className="profile-page__name">{user.displayName}</h1>
      <p className="profile-page__email">{user.email}</p>
      <p className="profile-page__joined">
        Joined {format(new Date(user.joinedAt), 'MMMM yyyy')}
      </p>

      <StreakDisplay user={user} />

      <div className="profile-badges card">
        <div className="profile-badges__header">
          <span>🏆</span>
          <h3>Streak Rewards</h3>
        </div>
        <div className="profile-badges__grid">
          {BADGES.map((badge) => {
            const unlocked = longestStreak >= badge.days;
            return (
              <div key={badge.label} className="profile-badge">
                <div
                  className="profile-badge__icon"
                  style={{
                    background: unlocked ? `${badge.color}26` : '#f5f5f5',
                    borderColor: unlocked ? `${badge.color}66` : '#e0e0e0',
                  }}
                >
                  <span style={{ opacity: unlocked ? 1 : 0.3 }}>{badge.icon}</span>
                </div>
                <span
                  className="profile-badge__label"
                  style={{ color: unlocked ? '#212121' : '#bdbdbd' }}
                >
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button className="btn btn--outline btn--danger btn--full" onClick={() => setShowLogout(true)}>
        🚪 Sign Out
      </button>

      {showLogout && (
        <div className="modal-overlay" onClick={() => setShowLogout(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Sign Out</h3>
            <p>Are you sure you want to sign out?</p>
            <div className="confirm-dialog__actions">
              <button className="btn btn--text" onClick={() => setShowLogout(false)}>Cancel</button>
              <button className="btn btn--danger" onClick={logout}>Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import './StreakDisplay.css';

function getStreakEmoji(streak) {
  if (streak >= 100) return '\u{1F525}\u{1F525}\u{1F525}';
  if (streak >= 30) return '\u{1F525}\u{1F525}';
  if (streak >= 7) return '\u{1F525}';
  if (streak >= 3) return '\u2B50';
  if (streak >= 1) return '\u26A1';
  return '\u{1F4A4}';
}

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

export default function StreakDisplay({ user, compact = false }) {
  const emoji = getStreakEmoji(user.currentStreak);
  const tier = getStreakTier(user.currentStreak);

  if (compact) {
    return (
      <div className="streak-compact">
        <span className="streak-compact__emoji">{emoji}</span>
        <span className="streak-compact__count">{user.currentStreak}</span>
      </div>
    );
  }

  const milestones = [3, 7, 14, 30, 50, 100, 365];
  const nextMilestone = milestones.find((m) => m > user.currentStreak) || 365;
  const prevMilestone = [...milestones].reverse().find((m) => m <= user.currentStreak) || 0;
  const range = Math.max(1, nextMilestone - prevMilestone);
  const progress = Math.min(1, Math.max(0, (user.currentStreak - prevMilestone) / range));

  return (
    <div className="streak-card card">
      <div className="streak-card__header">
        <div className="streak-card__icon">
          <span>{emoji}</span>
        </div>
        <div className="streak-card__info">
          <h3 className="streak-card__title">{user.currentStreak} Day Streak</h3>
          <span className="streak-card__tier">{tier}</span>
        </div>
      </div>

      <div className="streak-card__stats">
        <div className="streak-stat">
          <span className="streak-stat__icon">🏆</span>
          <span className="streak-stat__value">{user.longestStreak}</span>
          <span className="streak-stat__label">Longest</span>
        </div>
        <div className="streak-stat">
          <span className="streak-stat__icon">✅</span>
          <span className="streak-stat__value">{user.totalTasksCompleted}</span>
          <span className="streak-stat__label">Completed</span>
        </div>
        <div className="streak-stat">
          <span className="streak-stat__icon">⭐</span>
          <span className="streak-stat__value streak-stat__value--small">{tier}</span>
          <span className="streak-stat__label">Tier</span>
        </div>
      </div>

      <div className="streak-card__progress">
        <div className="streak-progress__labels">
          <span>Next milestone: {nextMilestone} days</span>
          <span>{user.currentStreak}/{nextMilestone}</span>
        </div>
        <div className="streak-progress__bar">
          <div
            className="streak-progress__fill"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

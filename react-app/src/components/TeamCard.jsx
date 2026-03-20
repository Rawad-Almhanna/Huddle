import './TeamCard.css';

export default function TeamCard({ team, currentUserId, onTap }) {
  const isLeader = team.leaderId === currentUserId;

  return (
    <div className="team-card card" onClick={onTap} role="button">
      <div className="team-card__icon">
        {team.name ? team.name[0].toUpperCase() : '?'}
      </div>
      <div className="team-card__info">
        <div className="team-card__name-row">
          <span className="team-card__name">{team.name}</span>
          {isLeader && <span className="team-card__leader-badge">Leader</span>}
        </div>
        <span className="team-card__members">
          👥 {team.memberIds.length} member{team.memberIds.length !== 1 ? 's' : ''}
        </span>
      </div>
      <span className="team-card__chevron">›</span>
    </div>
  );
}

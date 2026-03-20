import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTeam } from '../contexts/TeamContext';
import TeamCard from '../components/TeamCard';
import CreateTeam from './CreateTeam';
import TeamDetail from './TeamDetail';
import './Teams.css';

export default function Teams() {
  const { user } = useAuth();
  const { teams, loading, joinTeam } = useTeam();
  const [showJoin, setShowJoin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [joinCode, setJoinCode] = useState('');

  if (!user) return null;
  if (showCreate) return <CreateTeam onBack={() => setShowCreate(false)} />;
  if (selectedTeamId) return <TeamDetail teamId={selectedTeamId} onBack={() => setSelectedTeamId(null)} />;

  async function handleJoin() {
    if (joinCode.length !== 6) return;
    setShowJoin(false);
    await joinTeam(joinCode, user.uid, user.displayName);
    setJoinCode('');
  }

  return (
    <div className="teams-page">
      <div className="teams-page__header">
        <h1>Teams</h1>
        <div className="teams-page__actions">
          <button className="action-btn" onClick={() => setShowJoin(true)}>
            <span>👥</span> Join
          </button>
          <button className="action-btn action-btn--filled" onClick={() => setShowCreate(true)}>
            <span>+</span> Create
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><span className="spinner spinner--dark" /></div>
      ) : teams.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">👥</span>
          <h3>No teams yet</h3>
          <p>Create a team or join one with an invite code</p>
        </div>
      ) : (
        <div className="teams-page__list">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              currentUserId={user.uid}
              onTap={() => setSelectedTeamId(team.id)}
            />
          ))}
        </div>
      )}

      {showJoin && (
        <div className="modal-overlay" onClick={() => setShowJoin(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Join Team</h3>
            <p className="join-hint">Enter the 6-character invite code shared by your team leader.</p>
            <input
              className="join-input"
              type="text"
              maxLength={6}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="------"
            />
            <div className="confirm-dialog__actions">
              <button className="btn btn--text" onClick={() => setShowJoin(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleJoin}>Join</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

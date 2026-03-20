import { createContext, useContext, useState, useCallback } from 'react';

const TeamContext = createContext(null);

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error('useTeam must be used within TeamProvider');
  return ctx;
}

let nextId = 1;

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

export function TeamProvider({ children }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTeams = useCallback((uid) => {
    setLoading(false);
  }, []);

  const getTeam = useCallback(
    (teamId) => teams.find((t) => t.id === teamId) || null,
    [teams]
  );

  const createTeam = useCallback(async ({ name, description, leaderId, leaderName }) => {
    setError(null);
    const code = generateInviteCode();
    const team = {
      id: `team-${nextId++}`,
      name,
      description,
      leaderId,
      leaderName,
      memberIds: [leaderId],
      memberNames: { [leaderId]: leaderName },
      inviteCode: code,
      createdAt: new Date(),
    };
    setTeams((prev) => [...prev, team]);
    return team;
  }, []);

  const joinTeam = useCallback(async (code, uid, userName) => {
    setError('Join team is disabled in offline mode');
    return null;
  }, []);

  const leaveTeam = useCallback(async () => {}, []);
  const clearError = useCallback(() => setError(null), []);

  const value = {
    teams,
    loading,
    error,
    loadTeams,
    getTeam,
    createTeam,
    joinTeam,
    leaveTeam,
    clearError,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

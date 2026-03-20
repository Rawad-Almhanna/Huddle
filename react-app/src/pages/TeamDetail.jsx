import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTeam } from '../contexts/TeamContext';
import { useTask } from '../contexts/TaskContext';
import TaskCard from '../components/TaskCard';
import CreateTask from './CreateTask';
import TaskDetailModal from '../components/TaskDetailModal';
import './TeamDetail.css';

export default function TeamDetail({ teamId, onBack }) {
  const { user } = useAuth();
  const { getTeam } = useTeam();
  const { teamTasks, loadTeamTasks, markComplete } = useTask();
  const [showInfo, setShowInfo] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const team = getTeam(teamId);

  useEffect(() => {
    loadTeamTasks(teamId);
  }, [teamId, loadTeamTasks]);

  if (!user) return null;
  if (!team) {
    return (
      <div className="team-detail">
        <div className="form-page__bar">
          <button className="btn btn--icon" onClick={onBack}>←</button>
        </div>
        <div className="empty-state"><p>Team not found</p></div>
      </div>
    );
  }

  if (showCreate) return <CreateTask team={team} onBack={() => setShowCreate(false)} />;

  const isLeader = team.leaderId === user.uid;

  return (
    <div className="team-detail">
      <div className="form-page__bar">
        <button className="btn btn--icon" onClick={onBack}>←</button>
        <h2>{team.name}</h2>
        <button className="btn btn--icon" onClick={() => setShowInfo(true)} style={{ marginLeft: 'auto' }}>ℹ</button>
      </div>

      <div className="team-detail__header card">
        {team.description && <p className="team-detail__desc">{team.description}</p>}
        <div className="team-detail__meta">
          <span>👥 {team.memberIds.length} members</span>
          <button
            className="team-detail__code"
            onClick={() => navigator.clipboard.writeText(team.inviteCode)}
            title="Copy invite code"
          >
            🔑 <strong>{team.inviteCode}</strong> 📋
          </button>
        </div>
      </div>

      <div className="team-detail__tasks-bar">
        <h3>Tasks</h3>
        <span>{teamTasks.length} total</span>
      </div>

      {teamTasks.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">📋</span>
          <p>{isLeader ? 'No tasks yet. Create one!' : 'No tasks yet. Ask your leader to create one.'}</p>
        </div>
      ) : (
        <div className="team-detail__list">
          {teamTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              currentUserId={user.uid}
              onTap={() => setSelectedTask(task)}
              onComplete={
                task.completedBy?.[user.uid]
                  ? undefined
                  : () => markComplete(task.id, user.uid)
              }
            />
          ))}
        </div>
      )}

      {isLeader && (
        <button className="fab" onClick={() => setShowCreate(true)}>
          + New Task
        </button>
      )}

      {showInfo && (
        <div className="modal-overlay" onClick={() => setShowInfo(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-sheet__handle" />
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Members</h3>
            <div className="member-list">
              {Object.entries(team.memberNames).map(([id, name]) => (
                <div key={id} className="member-item">
                  <div className="avatar avatar--sm">{name?.[0]?.toUpperCase() || '?'}</div>
                  <span>{name}</span>
                  {id === team.leaderId && <span className="leader-tag">Leader</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} currentUserId={user.uid} />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import { useTeam } from '../contexts/TeamContext';
import StreakDisplay from '../components/StreakDisplay';
import TaskCard from '../components/TaskCard';
import Teams from './Teams';
import Profile from './Profile';
import './Home.css';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card" style={{ background: `${color}14`, border: `1px solid ${color}26` }}>
      <span className="stat-card__icon" style={{ color }}>{icon}</span>
      <span className="stat-card__value" style={{ color }}>{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}

function TaskDetailSheet({ task, onClose }) {
  if (!task) return null;

  const statusColors = { open: '#3B82F6', inProgress: '#F59E0B', completed: '#10B981' };
  const statusLabels = { open: 'Open', inProgress: 'In Progress', completed: 'Completed' };
  const priorityColors = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };
  const priorityLabels = { high: 'High', medium: 'Medium', low: 'Low' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-sheet__handle" />
        <h2 className="modal-sheet__title">{task.title}</h2>
        <div className="modal-sheet__chips">
          <span className="chip" style={{ background: `${statusColors[task.status]}15`, color: statusColors[task.status] }}>
            {statusLabels[task.status] || task.status}
          </span>
          <span className="chip" style={{ background: `${priorityColors[task.priority]}15`, color: priorityColors[task.priority] }}>
            {priorityLabels[task.priority] || task.priority}
          </span>
        </div>
        {task.description && <p className="modal-sheet__desc">{task.description}</p>}
        <div className="modal-sheet__field">
          <label>Team</label>
          <span>{task.teamName}</span>
        </div>
        <div className="modal-sheet__field">
          <label>Created by</label>
          <span>{task.createdByName}</span>
        </div>
        <div className="modal-sheet__field">
          <label>Assignees</label>
        </div>
        <div className="modal-sheet__assignees">
          {Object.entries(task.assigneeNames || {}).map(([id, name]) => (
            <div key={id} className="modal-sheet__assignee">
              <div className="avatar avatar--sm">{name?.[0]?.toUpperCase() || '?'}</div>
              <span>{name}</span>
              {task.completedBy?.[id] ? (
                <span className="assignee-done">✓</span>
              ) : (
                <span className="assignee-pending">○</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const { pendingTasks, todayCompletedCount, markComplete } = useTask();
  const [selectedTask, setSelectedTask] = useState(null);
  const [confirmTask, setConfirmTask] = useState(null);

  const highCount = pendingTasks.filter((t) => t.priority === 'high').length;

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <span className="dashboard__greeting">{getGreeting()}</span>
          <h1 className="dashboard__name">{user.displayName}</h1>
        </div>
        <StreakDisplay user={user} compact />
      </div>

      <div className="dashboard__stats">
        <StatCard icon="📋" label="Pending" value={pendingTasks.length} color="#3B82F6" />
        <StatCard icon="✅" label="Done Today" value={todayCompletedCount} color="#10B981" />
        <StatCard icon="❗" label="High" value={highCount} color="#EF4444" />
      </div>

      <div className="dashboard__tasks-header">
        <h2>Your Tasks</h2>
        {pendingTasks.length > 0 && (
          <span className="dashboard__pending-count">{pendingTasks.length} pending</span>
        )}
      </div>

      {pendingTasks.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">🎉</span>
          <h3>All caught up!</h3>
          <p>No pending tasks. Join a team to get started.</p>
        </div>
      ) : (
        <div className="dashboard__tasks">
          {pendingTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              currentUserId={user.uid}
              onTap={() => setSelectedTask(task)}
              onComplete={() => setConfirmTask(task)}
            />
          ))}
        </div>
      )}

      {confirmTask && (
        <div className="modal-overlay" onClick={() => setConfirmTask(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Complete Task</h3>
            <p>Mark &quot;{confirmTask.title}&quot; as done?</p>
            <div className="confirm-dialog__actions">
              <button className="btn btn--text" onClick={() => setConfirmTask(null)}>Cancel</button>
              <button
                className="btn btn--primary"
                onClick={() => {
                  markComplete(confirmTask.id, user.uid);
                  setConfirmTask(null);
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <TaskDetailSheet task={selectedTask} onClose={() => setSelectedTask(null)} />
    </div>
  );
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'teams', label: 'Teams', icon: '👥' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

export default function Home() {
  const { user } = useAuth();
  const { loadTeams } = useTeam();
  const { loadUserTasks } = useTask();
  const [tab, setTab] = useState('home');

  useEffect(() => {
    if (user) {
      loadTeams(user.uid);
      loadUserTasks(user.uid);
    }
  }, [user, loadTeams, loadUserTasks]);

  if (!user) return null;

  return (
    <div className="home-layout">
      <div className="home-layout__content">
        {tab === 'home' && <Dashboard />}
        {tab === 'teams' && <Teams />}
        {tab === 'profile' && <Profile />}
      </div>
      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`bottom-nav__item ${tab === item.id ? 'bottom-nav__item--active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            <span className="bottom-nav__icon">{item.icon}</span>
            <span className="bottom-nav__label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

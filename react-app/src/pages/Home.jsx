import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import { useTeam } from '../contexts/TeamContext';
import StreakDisplay from '../components/StreakDisplay';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/TaskDetailModal';
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

function Dashboard() {
  const { user } = useAuth();
  const { pendingTasks, todayCompletedCount, markComplete } = useTask();
  const [selectedTask, setSelectedTask] = useState(null);
  const [confirmTask, setConfirmTask] = useState(null);

  const highCount = pendingTasks.filter((t) => t.priority === 'high').length;

  return (
    <div className="dashboard">
      <div className="dashboard__top">
        <div className="dashboard__header">
          <div>
            <span className="dashboard__greeting">{getGreeting()}</span>
            <h1 className="dashboard__name">{user.displayName}</h1>
          </div>
        </div>

        <div className="dashboard__stats">
          <StatCard icon="📋" label="Pending" value={pendingTasks.length} color="#3B82F6" />
          <StatCard icon="✅" label="Done Today" value={todayCompletedCount} color="#10B981" />
          <StatCard icon="❗" label="High Priority" value={highCount} color="#EF4444" />
        </div>
      </div>

      <div className="dashboard__section">
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
          <div className="dashboard__tasks-grid">
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
      </div>

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

      <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} currentUserId={user.uid} />
    </div>
  );
}

const NAV_ITEMS = [
  { id: 'home', label: 'Dashboard', icon: '📊' },
  { id: 'teams', label: 'Teams', icon: '👥' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

const PAGE_TITLES = { home: 'Dashboard', teams: 'Teams', profile: 'Profile' };

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isMobile;
}

export default function Home() {
  const { user, logout } = useAuth();
  const { loadTeams } = useTeam();
  const { loadUserTasks } = useTask();
  const [tab, setTab] = useState('home');
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (user) {
      loadTeams(user.uid);
      loadUserTasks(user.uid);
    }
  }, [user, loadTeams, loadUserTasks]);

  if (!user) return null;

  function handleNavClick(id) {
    setTab(id);
    if (isMobile) setSidebarOpen(false);
  }

  return (
    <div className={`app-layout ${sidebarOpen ? '' : 'app-layout--collapsed'}`}>
      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : 'sidebar--collapsed'}`}>
        <div className="sidebar__brand">
          <div className="sidebar__logo">H</div>
          {sidebarOpen && <span className="sidebar__title">Huddle</span>}
        </div>
        <nav className="sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`sidebar__link ${tab === item.id ? 'sidebar__link--active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              title={item.label}
            >
              <span className="sidebar__link-icon">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar__footer">
          {sidebarOpen ? (
            <div className="sidebar__user">
              <div className="avatar avatar--sm">{user.displayName?.[0]?.toUpperCase()}</div>
              <div className="sidebar__user-info">
                <span className="sidebar__user-name">{user.displayName}</span>
                <span className="sidebar__user-email">{user.email}</span>
              </div>
            </div>
          ) : (
            <div className="sidebar__user-collapsed">
              <div className="avatar avatar--sm">{user.displayName?.[0]?.toUpperCase()}</div>
            </div>
          )}
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <button
            className="topbar__toggle"
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <h1 className="topbar__title">{PAGE_TITLES[tab]}</h1>
          <div className="topbar__right">
            <div className="topbar__streak-desktop">
              <StreakDisplay user={user} compact />
            </div>
            <div className="topbar__user" title={user.displayName}>
              <div className="avatar avatar--sm">{user.displayName?.[0]?.toUpperCase()}</div>
            </div>
            <button className="topbar__logout" onClick={logout} title="Sign out">
              🚪
            </button>
          </div>
        </header>
        <main className="main-content">
          {tab === 'home' && <Dashboard />}
          {tab === 'teams' && <Teams />}
          {tab === 'profile' && <Profile />}
        </main>
      </div>
    </div>
  );
}

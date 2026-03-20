import { format, differenceInDays } from 'date-fns';
import './TaskCard.css';

const PRIORITY_COLORS = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };
const STATUS_COLORS = { open: '#3B82F6', inProgress: '#F59E0B', completed: '#10B981' };
const STATUS_LABELS = { open: 'Open', inProgress: 'In Progress', completed: 'Completed' };
const PRIORITY_LABELS = { high: 'High', medium: 'Medium', low: 'Low' };

export default function TaskCard({ task, currentUserId, onTap, onComplete }) {
  const isCompletedByMe = task.completedBy && task.completedBy[currentUserId];
  const isFullyCompleted = task.status === 'completed';
  const completedCount = Object.keys(task.completedBy || {}).length;
  const progress = task.assigneeIds.length > 0 ? completedCount / task.assigneeIds.length : 0;
  const priorityColor = PRIORITY_COLORS[task.priority] || '#9e9e9e';
  const statusColor = STATUS_COLORS[task.status] || '#9e9e9e';

  const isDueWarning =
    task.dueDate &&
    task.status !== 'completed' &&
    differenceInDays(new Date(task.dueDate instanceof Date ? task.dueDate : task.dueDate), new Date()) <= 1;

  return (
    <div className="task-card card" onClick={onTap} role={onTap ? 'button' : undefined}>
      <div className="task-card__row">
        <div className="task-card__priority-bar" style={{ background: priorityColor }} />
        <div className="task-card__content">
          <span className={`task-card__title ${isFullyCompleted ? 'task-card__title--done' : ''}`}>
            {task.title}
          </span>
          {task.teamName && <span className="task-card__team">{task.teamName}</span>}
        </div>
        {!isCompletedByMe && !isFullyCompleted && onComplete && (
          <button
            className="task-card__complete-btn"
            onClick={(e) => { e.stopPropagation(); onComplete(); }}
            title="Mark as done"
          >
            ○
          </button>
        )}
        {isCompletedByMe && <span className="task-card__done-icon">✓</span>}
      </div>

      {task.description && (
        <p className="task-card__desc">{task.description}</p>
      )}

      <div className="task-card__footer">
        <div className="task-card__chips">
          <span className="chip" style={{ background: `${statusColor}15`, color: statusColor }}>
            {STATUS_LABELS[task.status] || task.status}
          </span>
          <span className="chip" style={{ background: `${priorityColor}15`, color: priorityColor }}>
            {PRIORITY_LABELS[task.priority] || task.priority}
          </span>
        </div>
        {task.dueDate && (
          <span className={`task-card__due ${isDueWarning ? 'task-card__due--warn' : ''}`}>
            🕐 {format(new Date(task.dueDate instanceof Date ? task.dueDate : task.dueDate), 'MMM d')}
          </span>
        )}
      </div>

      {task.assigneeIds.length > 1 && (
        <div className="task-card__progress-section">
          <div className="task-card__progress-labels">
            <span>{completedCount}/{task.assigneeIds.length} completed</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="task-card__progress-bar">
            <div
              className="task-card__progress-fill"
              style={{
                width: `${progress * 100}%`,
                background: progress >= 1 ? '#10B981' : '#6C63FF',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

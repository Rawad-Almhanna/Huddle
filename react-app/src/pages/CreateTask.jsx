import { useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import './FormPage.css';

const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_COLORS = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };

export default function CreateTask({ team, onBack }) {
  const { user } = useAuth();
  const { createTask } = useTask();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState(new Set(team.memberIds));
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  function toggleAssignee(id) {
    setSelectedAssignees((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (selectedAssignees.size === 0) errs.assignees = 'Select at least one assignee';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    const assigneeNames = {};
    selectedAssignees.forEach((id) => {
      assigneeNames[id] = team.memberNames[id] || 'Unknown';
    });

    await createTask({
      title: title.trim(),
      description: description.trim(),
      teamId: team.id,
      teamName: team.name,
      createdBy: user.uid,
      createdByName: user.displayName,
      assigneeIds: [...selectedAssignees],
      assigneeNames,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    setSubmitting(false);
    onBack();
  }

  return (
    <div className="form-page">
      <div className="form-page__bar">
        <button className="btn btn--icon" onClick={onBack}>←</button>
        <h2>Create Task</h2>
      </div>
      <form className="form-page__body" onSubmit={handleSubmit}>
        <label className="section-label">Title</label>
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        {errors.title && <span className="form-error">{errors.title}</span>}

        <label className="section-label" style={{ marginTop: 20 }}>Description (optional)</label>
        <textarea
          className="form-textarea"
          placeholder="Add details about this task..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="section-label" style={{ marginTop: 20 }}>Priority</label>
        <div className="priority-selector">
          {PRIORITIES.map((p) => {
            const color = PRIORITY_COLORS[p];
            const isActive = priority === p;
            return (
              <button
                key={p}
                type="button"
                className={`priority-option ${isActive ? 'priority-option--active' : ''}`}
                style={{
                  background: isActive ? `${color}26` : '#f5f5f5',
                  borderColor: isActive ? color : 'transparent',
                  color: isActive ? color : '#757575',
                }}
                onClick={() => setPriority(p)}
              >
                {p[0].toUpperCase() + p.slice(1)}
              </button>
            );
          })}
        </div>

        <label className="section-label" style={{ marginTop: 20 }}>Due Date (optional)</label>
        <div className="input-wrapper">
          <span className="input-icon">📅</span>
          <input
            type="date"
            value={dueDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDueDate(e.target.value)}
          />
          {dueDate && (
            <button type="button" className="input-toggle" onClick={() => setDueDate('')}>✕</button>
          )}
        </div>

        <label className="section-label" style={{ marginTop: 20 }}>Assign To</label>
        {errors.assignees && <span className="form-error">{errors.assignees}</span>}
        <div className="assignee-chips">
          {Object.entries(team.memberNames).map(([id, name]) => {
            const isSelected = selectedAssignees.has(id);
            return (
              <button
                key={id}
                type="button"
                className={`assignee-chip ${isSelected ? 'assignee-chip--active' : ''}`}
                onClick={() => toggleAssignee(id)}
              >
                <span className="assignee-chip__avatar">{name?.[0]?.toUpperCase() || '?'}</span>
                {name}
              </button>
            );
          })}
        </div>

        <button className="btn btn--primary btn--full" disabled={submitting} style={{ marginTop: 32 }}>
          {submitting ? <span className="spinner" /> : 'Create Task'}
        </button>
      </form>
    </div>
  );
}

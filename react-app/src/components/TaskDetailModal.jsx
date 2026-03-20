import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import './TaskDetailModal.css';

const STATUS_COLORS = { open: '#3B82F6', inProgress: '#F59E0B', completed: '#10B981' };
const STATUS_LABELS = { open: 'Open', inProgress: 'In Progress', completed: 'Completed' };
const PRIORITY_COLORS = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };
const PRIORITY_LABELS = { high: 'High', medium: 'Medium', low: 'Low' };
const PRIORITIES = ['low', 'medium', 'high'];

export default function TaskDetailModal({ task, onClose, currentUserId }) {
  const { editTask, addComment, getTask } = useTask();
  const [activeTab, setActiveTab] = useState('details');
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editDueDate, setEditDueDate] = useState('');
  const [commentText, setCommentText] = useState('');
  const { user } = useAuth();

  const liveTask = getTask(task?.id) || task;

  useEffect(() => {
    if (liveTask && editing) {
      setEditTitle(liveTask.title);
      setEditDesc(liveTask.description || '');
      setEditPriority(liveTask.priority);
      setEditDueDate(
        liveTask.dueDate
          ? (liveTask.dueDate instanceof Date ? liveTask.dueDate : new Date(liveTask.dueDate))
              .toISOString().split('T')[0]
          : ''
      );
    }
  }, [editing, liveTask]);

  useEffect(() => {
    setActiveTab('details');
    setEditing(false);
  }, [task?.id]);

  if (!task || !liveTask) return null;

  function handleSaveEdit() {
    editTask(liveTask.id, {
      title: editTitle.trim() || liveTask.title,
      description: editDesc.trim(),
      priority: editPriority,
      dueDate: editDueDate ? new Date(editDueDate) : null,
    });
    setEditing(false);
  }

  function handleAddComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(liveTask.id, {
      id: `c-${Date.now()}`,
      text: commentText.trim(),
      authorId: user.uid,
      authorName: user.displayName,
      createdAt: new Date(),
    });
    setCommentText('');
  }

  const comments = liveTask.comments || [];
  const isCreator = liveTask.createdBy === currentUserId;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog modal-dialog--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-dialog__header">
          <h2>{liveTask.title}</h2>
          <button className="btn btn--icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-dialog__chips">
          <span className="chip" style={{ background: `${STATUS_COLORS[liveTask.status]}15`, color: STATUS_COLORS[liveTask.status] }}>
            {STATUS_LABELS[liveTask.status] || liveTask.status}
          </span>
          <span className="chip" style={{ background: `${PRIORITY_COLORS[liveTask.priority]}15`, color: PRIORITY_COLORS[liveTask.priority] }}>
            {PRIORITY_LABELS[liveTask.priority] || liveTask.priority}
          </span>
        </div>

        <div className="modal-tabs">
          <button className={`modal-tab ${activeTab === 'details' ? 'modal-tab--active' : ''}`} onClick={() => setActiveTab('details')}>
            Details
          </button>
          <button className={`modal-tab ${activeTab === 'comments' ? 'modal-tab--active' : ''}`} onClick={() => setActiveTab('comments')}>
            Comments {comments.length > 0 && <span className="modal-tab__badge">{comments.length}</span>}
          </button>
        </div>

        {activeTab === 'details' && !editing && (
          <div className="modal-dialog__body">
            {liveTask.description && <p className="modal-dialog__desc">{liveTask.description}</p>}
            <div className="modal-dialog__grid">
              <div className="modal-dialog__field">
                <label>Team</label>
                <span>{liveTask.teamName}</span>
              </div>
              <div className="modal-dialog__field">
                <label>Created by</label>
                <span>{liveTask.createdByName}</span>
              </div>
            </div>
            {liveTask.dueDate && (
              <div className="modal-dialog__field">
                <label>Due date</label>
                <span>{new Date(liveTask.dueDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            )}
            <div className="modal-dialog__field">
              <label>Assignees</label>
            </div>
            <div className="modal-dialog__assignees">
              {Object.entries(liveTask.assigneeNames || {}).map(([id, name]) => (
                <div key={id} className="modal-dialog__assignee">
                  <div className="avatar avatar--sm">{name?.[0]?.toUpperCase() || '?'}</div>
                  <span>{name}</span>
                  {liveTask.completedBy?.[id] ? (
                    <span className="assignee-done">✓</span>
                  ) : (
                    <span className="assignee-pending">○</span>
                  )}
                </div>
              ))}
            </div>
            {isCreator && (
              <button className="btn btn--outline btn--sm" style={{ marginTop: 20 }} onClick={() => setEditing(true)}>
                ✏️ Edit Task
              </button>
            )}
          </div>
        )}

        {activeTab === 'details' && editing && (
          <div className="modal-dialog__body">
            <div className="modal-edit-form">
              <label className="section-label">Title</label>
              <div className="input-wrapper">
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>

              <label className="section-label" style={{ marginTop: 16 }}>Description</label>
              <textarea className="form-textarea" rows={3} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />

              <label className="section-label" style={{ marginTop: 16 }}>Priority</label>
              <div className="priority-selector">
                {PRIORITIES.map((p) => {
                  const color = PRIORITY_COLORS[p];
                  const isActive = editPriority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      className={`priority-option ${isActive ? 'priority-option--active' : ''}`}
                      style={{ background: isActive ? `${color}26` : '#f5f5f5', borderColor: isActive ? color : 'transparent', color: isActive ? color : '#757575' }}
                      onClick={() => setEditPriority(p)}
                    >
                      {p[0].toUpperCase() + p.slice(1)}
                    </button>
                  );
                })}
              </div>

              <label className="section-label" style={{ marginTop: 16 }}>Due Date</label>
              <div className="input-wrapper">
                <span className="input-icon">📅</span>
                <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
                {editDueDate && <button type="button" className="input-toggle" onClick={() => setEditDueDate('')}>✕</button>}
              </div>

              <div className="modal-edit-actions">
                <button className="btn btn--text" onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn btn--primary btn--sm" onClick={handleSaveEdit}>Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="modal-dialog__body">
            <form className="comment-form" onSubmit={handleAddComment}>
              <div className="comment-form__row">
                <div className="avatar avatar--sm">{user.displayName?.[0]?.toUpperCase()}</div>
                <input
                  className="comment-input"
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button type="submit" className="btn btn--primary btn--sm" disabled={!commentText.trim()}>
                  Send
                </button>
              </div>
            </form>

            <div className="comments-list">
              {comments.length === 0 ? (
                <div className="comments-empty">
                  <span>💬</span>
                  <p>No comments yet. Start the conversation.</p>
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="comment-item">
                    <div className="avatar avatar--sm">{c.authorName?.[0]?.toUpperCase() || '?'}</div>
                    <div className="comment-item__body">
                      <div className="comment-item__header">
                        <span className="comment-item__author">{c.authorName}</span>
                        <span className="comment-item__time">
                          {new Date(c.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="comment-item__text">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

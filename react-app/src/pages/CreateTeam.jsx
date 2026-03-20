import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTeam } from '../contexts/TeamContext';
import './FormPage.css';

export default function CreateTeam({ onBack }) {
  const { user } = useAuth();
  const { createTeam } = useTeam();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [inviteCode, setInviteCode] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    else if (name.trim().length < 2) errs.name = 'Too short';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    const team = await createTeam({
      name: name.trim(),
      description: description.trim(),
      leaderId: user.uid,
      leaderName: user.displayName,
    });
    setSubmitting(false);

    if (team) {
      setInviteCode(team.inviteCode);
    }
  }

  if (inviteCode) {
    return (
      <div className="form-page">
        <div className="form-page__bar">
          <button className="btn btn--icon" onClick={onBack}>←</button>
          <h2>Create Team</h2>
        </div>
        <div className="invite-result">
          <h3>&quot;{name}&quot; created!</h3>
          <p>Share this invite code with your team members:</p>
          <div className="invite-code">{inviteCode}</div>
          <button className="btn btn--primary btn--full" onClick={onBack}>Got it</button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-page__bar">
        <button className="btn btn--icon" onClick={onBack}>←</button>
        <h2>Create Team</h2>
      </div>
      <form className="form-page__body" onSubmit={handleSubmit}>
        <label className="section-label">Team Name</label>
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="e.g. Design Squad"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        {errors.name && <span className="form-error">{errors.name}</span>}

        <label className="section-label" style={{ marginTop: 20 }}>Description (optional)</label>
        <textarea
          className="form-textarea"
          placeholder="What does your team work on?"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button className="btn btn--primary btn--full" disabled={submitting} style={{ marginTop: 32 }}>
          {submitting ? <span className="spinner" /> : 'Create Team'}
        </button>
      </form>
    </div>
  );
}

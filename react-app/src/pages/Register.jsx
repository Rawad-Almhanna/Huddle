import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    else if (name.trim().length < 2) errs.name = 'Name is too short';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!email.includes('@')) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'At least 6 characters';
    if (confirm !== password) errs.confirm = 'Passwords do not match';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      navigate('/');
    }, 500);
  }

  return (
    <div className="auth-page">
      <div className="auth-top-bar">
        <button className="btn btn--icon" onClick={() => navigate(-1)}>←</button>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join your team and start tracking tasks</p>

        <div className="form-group">
          <div className="input-wrapper">
            <span className="input-icon">👤</span>
            <input
              type="text"
              placeholder="Display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <div className="input-wrapper">
            <span className="input-icon">✉</span>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <div className="input-wrapper">
            <span className="input-icon">🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="input-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        <div className="form-group">
          <div className="input-wrapper">
            <span className="input-icon">🔒</span>
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button type="button" className="input-toggle" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? '🙈' : '👁'}
            </button>
          </div>
          {errors.confirm && <span className="form-error">{errors.confirm}</span>}
        </div>

        <button className="btn btn--primary btn--full" disabled={submitting}>
          {submitting ? <span className="spinner" /> : 'Create Account'}
        </button>

        <p className="auth-switch">
          Already have an account?{' '}
          <button type="button" className="link-btn" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </p>
      </form>
    </div>
  );
}

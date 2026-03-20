import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!email.includes('@')) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
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
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-logo">✓</div>
        <h1 className="auth-title">Huddle</h1>
        <p className="auth-subtitle">Collaborate. Complete. Conquer.</p>

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

        <button className="btn btn--primary btn--full" disabled={submitting}>
          {submitting ? <span className="spinner" /> : 'Sign In'}
        </button>

        <p className="auth-switch">
          Don&apos;t have an account?{' '}
          <button type="button" className="link-btn" onClick={() => navigate('/register')}>
            Sign Up
          </button>
        </p>
      </form>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginView: React.FC = () => {
  const { login, error } = useAuth();
  const [email, setEmail] = useState('teacher@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await login(email, password);
    } catch (err) {
      setMessage('Unable to authenticate. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="card" onSubmit={handleSubmit}>
        <h1>KRUchat Activity Tracker</h1>
        <p className="muted">Sign in with your local account to continue.</p>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        {(error || message) && <p className="error">{message ?? error}</p>}
        <p className="hint">Try teacher@example.com or supervisor@example.com with password123.</p>
      </form>
    </div>
  );
};

export default LoginView;

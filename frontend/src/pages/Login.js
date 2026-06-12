import React, { useState } from 'react';
import { post } from '../utils/api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await post('/api/auth/login', { username, password });
      localStorage.setItem('fm_token', res.access_token);
      onLogin(res);
    } catch {
      setError('Invalid credentials. Try demo / demo123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0f1e',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#111827', border: '1px solid #1e3a5f',
        borderRadius: 16, padding: '2.5rem', width: 400, maxWidth: '90vw',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🚢</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#38bdf8', marginBottom: 4 }}>FreightMind</h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>Autonomous Global Freight Intelligence Platform</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Username</label>
            <input
              value={username} onChange={e => setUsername(e.target.value)}
              style={{
                width: '100%', background: '#1e293b', border: '1px solid #334155',
                borderRadius: 8, padding: '10px 14px', color: '#e2e8f0',
                fontSize: 14, outline: 'none',
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%', background: '#1e293b', border: '1px solid #334155',
                borderRadius: 8, padding: '10px 14px', color: '#e2e8f0',
                fontSize: 14, outline: 'none',
              }}
            />
          </div>
          {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            width: '100%', background: loading ? '#1e3a5f' : '#0ea5e9',
            color: '#fff', border: 'none', borderRadius: 8, padding: '12px',
            fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#0f172a', borderRadius: 8 }}>
          <p style={{ color: '#64748b', fontSize: 12, marginBottom: 6 }}>Demo credentials:</p>
          <p style={{ color: '#38bdf8', fontSize: 12 }}>demo / demo123 — full access</p>
          <p style={{ color: '#64748b', fontSize: 12 }}>viewer / viewer123 — read only</p>
        </div>
      </div>
    </div>
  );
}

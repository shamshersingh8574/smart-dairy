'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { KeyRound, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      await login(email, password);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '420px', margin: '40px auto 100px', padding: '0 20px' }}>
      <div className="card" style={{ padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Access your subscriptions and wallet
          </p>
        </div>

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#fff5f5',
            color: 'var(--error)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 600,
            borderLeft: '4px solid var(--error)',
            marginBottom: '20px'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input
                type="email"
                className="form-input"
                style={{ width: '100%', paddingLeft: '42px' }}
                placeholder="customer@dairyfarm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '26px' }}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input
                type="password"
                className="form-input"
                style={{ width: '100%', paddingLeft: '42px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={submitting}>
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link href="/auth/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Sign Up Now
          </Link>
        </div>

        <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '15px', fontSize: '12px', color: 'var(--text-light)', textAlign: 'center' }}>
          💡 <span style={{ fontWeight: 600 }}>Demo credentials:</span><br />
          Customer: <b>customer@dairyfarm.com</b> / password: <b>customer123</b><br />
          Franchise: <b>franchise@dairyfarm.com</b> / password: <b>franchise123</b><br />
          Admin: <b>admin@dairyfarm.com</b> / password: <b>admin123</b>
        </div>
      </div>
    </div>
  );
}

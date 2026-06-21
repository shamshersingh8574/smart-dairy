'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { User, Mail, Phone, KeyRound, Ticket, Briefcase, AlertCircle } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer');
  const [referredByCode, setReferredByCode] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await register({ name, email, password, phone, role, referredByCode });
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '460px', margin: '40px auto 100px', padding: '0 20px' }}>
      <div className="card" style={{ padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800 }}>Create Account</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Join GreenMeadow Dairy & Get ₹100 Free!
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
            <label>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', paddingLeft: '42px' }}
                placeholder="Rohan Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input
                type="email"
                className="form-input"
                style={{ width: '100%', paddingLeft: '42px' }}
                placeholder="rohan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input
                type="tel"
                className="form-input"
                style={{ width: '100%', paddingLeft: '42px' }}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
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

          <div className="form-group">
            <label>Join As (Role Selection)</label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={16} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <select
                className="form-input"
                style={{ width: '100%', paddingLeft: '42px', appearance: 'none', cursor: 'pointer' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="customer">Customer (Buy Milk, Subscribe)</option>
                <option value="franchise">Franchise Owner (Service Areas & Commissions)</option>
                <option value="delivery">Delivery Agent (Confirm Deliveries & OTPs)</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '26px' }}>
            <label>Referral Code (Optional - get ₹50 bonus!)</label>
            <div style={{ position: 'relative' }}>
              <Ticket size={16} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', paddingLeft: '42px' }}
                placeholder="DAIRY-XXXXX"
                value={referredByCode}
                onChange={(e) => setReferredByCode(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={submitting}>
            {submitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}

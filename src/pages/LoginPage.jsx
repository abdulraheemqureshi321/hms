import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, KeyRound, Mail, User, Phone, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, registerGuest } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await registerGuest({ name, email, password, phone });
        navigate('/guest-dashboard');
      } else {
        const userRes = await login(email, password);
        if (userRes.role === 'Guest') {
          navigate('/guest-dashboard');
        } else {
          navigate('/admin');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      minHeight: 'calc(100vh - 120px)',
      padding: '40px 20px',
      margin: '0 auto',
      background: '#ffffff'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '40px', margin: '0 auto', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--accent-gradient)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '12px',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
          }}>
            <Building2 size={24} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a' }}>
            {isRegister ? 'Create Guest Account' : 'Welcome Back'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
            {isRegister ? 'Sign up to manage online room bookings' : 'Sign in to access your dashboard'}
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(225, 29, 72, 0.1)',
            border: '1px solid rgba(225, 29, 72, 0.3)',
            color: '#e11d48',
            fontSize: '0.85rem',
            marginBottom: '20px',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegister && (
            <>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', fontWeight: '600' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 'var(--radius-sm)',
                      color: '#0f172a',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', fontWeight: '600' }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555-0192"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 'var(--radius-sm)',
                      color: '#0f172a',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', fontWeight: '600' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@hms.com"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 'var(--radius-sm)',
                  color: '#0f172a',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', fontWeight: '600' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 'var(--radius-sm)',
                  color: '#0f172a',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
            {loading ? 'Authenticating...' : isRegister ? 'Register & Continue' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}
          >
            {isRegister ? 'Already have an account? Sign In' : 'Need a guest portal account? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}

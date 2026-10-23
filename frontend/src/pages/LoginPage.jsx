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
      setError(err.message || 'Authentication failed. Please verify your credentials.');
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
      background: 'var(--bg-dark)'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '36px', margin: '0 auto', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0b5e39 0%, #15803d 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            marginBottom: '12px',
            boxShadow: '0 4px 14px rgba(11, 94, 57, 0.25)'
          }}>
            <Building2 size={22} strokeWidth={2.2} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
            {isRegister ? 'Create Guest Account' : 'Staff & Guest Sign In'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.84rem', marginTop: '4px' }}>
            {isRegister ? 'Register your account to manage stays online' : 'CareHaven Luxury Resort & Suites PMS'}
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px 12px',
            borderRadius: '6px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            fontSize: '0.82rem',
            marginBottom: '18px',
            lineHeight: 1.4
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isRegister && (
            <>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#52525b', marginBottom: '5px', display: 'block', fontWeight: 500 }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      background: '#ffffff',
                      border: '1px solid #e4e4e7',
                      borderRadius: '6px',
                      color: '#09090b',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#52525b', marginBottom: '5px', display: 'block', fontWeight: 500 }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      background: '#ffffff',
                      border: '1px solid #e4e4e7',
                      borderRadius: '6px',
                      color: '#09090b',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', color: '#52525b', marginBottom: '5px', display: 'block', fontWeight: 500 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@carehaven.com"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  background: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '6px',
                  color: '#09090b',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#52525b', marginBottom: '5px', display: 'block', fontWeight: 500 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  background: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '6px',
                  color: '#09090b',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '10px', marginTop: '6px' }}>
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'} <ArrowRight size={15} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f4f4f5' }}>
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500 }}
          >
            {isRegister ? 'Already registered? Sign in' : 'Need a guest portal account? Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
}

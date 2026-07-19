'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    // Simulate network authentication delay for high fidelity experience
    setTimeout(() => {
      // Allow demo accounts
      const validAccounts = [
        { email: 'admin@epc.ai', role: 'Administrator' },
        { email: 'engineer@epc.ai', role: 'Lead Engineer' },
        { email: 'operator@epc.ai', role: 'Operations Officer' }
      ];

      const user = validAccounts.find(acc => acc.email === email.toLowerCase());

      if (user && password === 'password') {
        localStorage.setItem('auth_token', 'simulated-token-' + Math.random().toString(36).substr(2));
        localStorage.setItem('user_email', user.email);
        localStorage.setItem('user_role', user.role);
        router.push('/dashboard');
      } else {
        setError('Invalid credentials. Hint: use the quick login buttons below.');
        setLoading(false);
      }
    }, 1200);
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#f8fafc',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Glows */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(13, 148, 136, 0.12) 0%, transparent 70%)',
        top: '-10%',
        left: '-10%',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, transparent 70%)',
        bottom: '-10%',
        right: '-10%',
        zIndex: 0
      }} />

      {/* Login Container */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '1rem',
        padding: '2.5rem 2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        zIndex: 10,
        position: 'relative'
      }}>
        {/* Header Badge */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: 'rgba(13, 148, 136, 0.1)',
            border: '1px solid rgba(13, 148, 136, 0.2)',
            borderRadius: '9999px',
            color: '#2dd4bf',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            EPC Security Portal
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Welcome Back
          </h2>
          <p style={{
            color: '#94a3b8',
            fontSize: '0.875rem',
            lineHeight: 1.4
          }}>
            Sign in to access your data centre delivery workspace
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="shake-alert" style={{
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '0.5rem',
            color: '#fca5a5',
            fontSize: '0.825rem',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            animation: 'shake 0.3s'
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Email input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="email" style={{
              fontSize: '0.825rem',
              fontWeight: 500,
              color: '#cbd5e1'
            }}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="e.g. admin@epc.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                color: '#ffffff',
                fontSize: '0.925rem',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0d9488';
                e.target.style.boxShadow = '0 0 0 2px rgba(13, 148, 136, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Password input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="password" style={{
              fontSize: '0.825rem',
              fontWeight: 500,
              color: '#cbd5e1'
            }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                color: '#ffffff',
                fontSize: '0.925rem',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0d9488';
                e.target.style.boxShadow = '0 0 0 2px rgba(13, 148, 136, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Options */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.825rem',
            marginTop: '0.2rem'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#94a3b8' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                style={{
                  accentColor: '#0d9488',
                  width: '14px',
                  height: '14px'
                }}
              />
              Remember this device
            </label>
            <span style={{ color: '#0d9488', cursor: 'pointer', fontWeight: 500 }}>
              Forgot password?
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
              marginTop: '0.5rem'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.filter = 'brightness(1.1)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.filter = 'none';
              e.currentTarget.style.transform = 'none';
            }}
          >
            {loading ? (
              <>
                <div style={{
                  border: '2px solid rgba(255,255,255,0.2)',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  borderLeftColor: '#ffffff',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '2rem 0 1.5rem',
          fontSize: '0.75rem',
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ padding: '0 0.75rem' }}>Demo Quick Logins</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Quick Logins Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem'
        }}>
          <button
            onClick={() => handleQuickLogin('admin@epc.ai')}
            style={{
              padding: '0.5rem',
              background: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '0.375rem',
              color: '#94a3b8',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'rgba(13, 148, 136, 0.4)';
              e.currentTarget.style.color = '#2dd4bf';
              e.currentTarget.style.background = 'rgba(13, 148, 136, 0.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
            }}
          >
            Admin Role
          </button>
          
          <button
            onClick={() => handleQuickLogin('engineer@epc.ai')}
            style={{
              padding: '0.5rem',
              background: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '0.375rem',
              color: '#94a3b8',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'rgba(13, 148, 136, 0.4)';
              e.currentTarget.style.color = '#2dd4bf';
              e.currentTarget.style.background = 'rgba(13, 148, 136, 0.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
            }}
          >
            Engineer Role
          </button>
        </div>
      </div>

      {/* Global Spin & Shake Keyframe styles */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}

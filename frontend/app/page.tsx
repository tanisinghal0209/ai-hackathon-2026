'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [targetPath, setTargetPath] = useState('/login');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setTargetPath('/dashboard');
    }
  }, []);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      textAlign: 'center',
      background: 'radial-gradient(circle at top, rgba(99, 102, 241, 0.15), transparent 60%)',
    }}>
      <div style={{
        maxWidth: '800px',
        padding: '3rem',
        background: 'var(--bg-surface)',
        border: 'var(--glass-border)',
        borderRadius: 'var(--border-radius)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      }}>
        <div style={{
          display: 'inline-flex',
          padding: '0.5rem 1rem',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '9999px',
          color: 'var(--accent-primary)',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '2rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          💡 EPC Industrial Intelligence Layer
        </div>

        <h1 style={{
          fontSize: '3rem',
          fontWeight: 800,
          lineHeight: 1.2,
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          AI EPC Project Intelligence Platform
        </h1>

        <p style={{
          fontSize: '1.125rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '2.5rem',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          A unified intelligence system for Tier III and Tier IV data centre construction. Detect specification deviations, predict critical path schedule risks, and extract verified document knowledge.
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
        }}>
          <Link href={targetPath} style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.875rem 2rem',
            background: 'var(--accent-primary)',
            color: '#ffffff',
            borderRadius: '0.5rem',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          }}>
            Enter Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}

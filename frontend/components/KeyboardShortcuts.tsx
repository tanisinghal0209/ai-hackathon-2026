"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function KeyboardShortcuts() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is typing in form elements
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Allow escaping inputs
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // Check Ctrl key shortcuts
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'u':
            e.preventDefault();
            router.push('/documents');
            break;
          case 'k':
            e.preventDefault();
            router.push('/knowledge');
            break;
          case 'd':
            e.preventDefault();
            router.push('/dashboard');
            break;
          case 'c':
            e.preventDefault();
            router.push('/compliance');
            break;
          case 's':
            e.preventDefault();
            router.push('/schedule');
            break;
          case 'r':
            e.preventDefault();
            router.push('/risks');
            break;
          case 'h':
          case '/':
            e.preventDefault();
            setShowModal(prev => !prev);
            break;
          default:
            break;
        }
      } else {
        // Plain key shortcuts
        if (e.key === '?') {
          e.preventDefault();
          setShowModal(true);
        } else if (e.key === 'Escape') {
          setShowModal(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  if (!showModal) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 99999,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: 'var(--glass-border)',
        borderRadius: 'var(--border-radius)',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        color: 'var(--text-primary)'
      }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>🎹 Keyboard Shortcuts Guide</h3>
          <button 
            onClick={() => setShowModal(false)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem' }}
          >
            ×
          </button>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Project Overview Dashboard</span>
            <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.8rem' }}>Ctrl + D</kbd>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Document Library</span>
            <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.8rem' }}>Ctrl + U</kbd>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Knowledge Copilot</span>
            <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.8rem' }}>Ctrl + K</kbd>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Compliance Dashboard</span>
            <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.8rem' }}>Ctrl + C</kbd>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Schedule Intelligence</span>
            <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.8rem' }}>Ctrl + S</kbd>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Risk Center</span>
            <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.8rem' }}>Ctrl + R</kbd>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
            <span>Toggle Shortcuts Guide</span>
            <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.8rem' }}>?</kbd>
          </div>
        </div>

        <button 
          onClick={() => setShowModal(false)}
          style={{
            marginTop: '1.5rem',
            width: '100%',
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            padding: '0.5rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Got it!
        </button>
      </div>
    </div>
  );
}

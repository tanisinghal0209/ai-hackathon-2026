"use client";
import React from 'react';
import { useUIStore } from '@/store/store';

export default function RightPanel() {
  const { rightPanelOpen, toggleRightPanel } = useUIStore();

  if (!rightPanelOpen) return null;

  return (
    <div className="right-panel-wrapper" style={{
      width: '350px',
      background: 'var(--bg-secondary)',
      borderLeft: 'var(--glass-border)',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.1)'
    }}>
      <header style={{
        padding: '1rem',
        borderBottom: 'var(--glass-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Knowledge Copilot</h3>
        <button 
          onClick={toggleRightPanel}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1.25rem'
          }}
        >
          ×
        </button>
      </header>

      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Placeholder for Contextual AI Assistant Chat */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          padding: '1rem',
          borderRadius: 'var(--border-radius)',
          borderLeft: '3px solid var(--accent-primary)',
          fontSize: '0.85rem'
        }}>
          <strong>Context Panel:</strong> AI Assistance is currently scoped to your active view.
        </div>
        
        <div style={{ 
          background: 'var(--bg-surface)', 
          padding: '1rem', 
          borderRadius: 'var(--border-radius)', 
          fontSize: '0.85rem',
          border: 'var(--glass-border)'
        }}>
          How can I help you analyze this project information?
        </div>
      </div>

      <footer style={{ padding: '1rem', borderTop: 'var(--glass-border)' }}>
        <input 
          type="text" 
          placeholder="Ask Knowledge Copilot..." 
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: 'var(--border-radius)',
            border: 'var(--glass-border)',
            background: 'var(--bg-hover)',
            color: 'var(--text-primary)',
            outline: 'none'
          }}
        />
      </footer>
    </div>
  );
}

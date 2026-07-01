import React from 'react';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Project Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Overview of AI Intelligence Platform for Data Centre EPC Projects
        </p>
      </header>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {/* Metric Card 1 */}
        <div style={{
          background: 'var(--bg-surface)',
          border: 'var(--glass-border)',
          borderRadius: 'var(--border-radius)',
          padding: '1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Active RFIs
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>24</p>
        </div>

        {/* Metric Card 2 */}
        <div style={{
          background: 'var(--bg-surface)',
          border: 'var(--glass-border)',
          borderRadius: 'var(--border-radius)',
          padding: '1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Compliance Deviations
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444' }}>7</p>
        </div>

        {/* Metric Card 3 */}
        <div style={{
          background: 'var(--bg-surface)',
          border: 'var(--glass-border)',
          borderRadius: 'var(--border-radius)',
          padding: '1.5rem',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Schedule Risks
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>3 Critical</p>
        </div>
      </div>
    </div>
  );
}

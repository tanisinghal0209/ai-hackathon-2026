"use client";
import React from 'react';

interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  dataSource?: string;
  className?: string;
}

export function Card({ title, description, children, dataSource, className = '' }: CardProps) {
  return (
    <div className={`card-component ${className}`} style={{
      background: 'var(--bg-surface)',
      border: 'var(--glass-border)',
      borderRadius: 'var(--border-radius)',
      padding: '1.5rem',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      transition: 'var(--transition-smooth)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
    }}>
      {(title || description) && (
        <header style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {title && <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{title}</h3>}
            {dataSource && (
              <span style={{ fontSize: '0.65rem', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                {dataSource}
              </span>
            )}
          </div>
          {description && <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>{description}</p>}
        </header>
      )}
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}

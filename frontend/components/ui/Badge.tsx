"use client";
import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'critical' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  let bgColor = 'rgba(255, 255, 255, 0.1)';
  let textColor = 'var(--text-secondary)';
  let borderColor = 'rgba(255, 255, 255, 0.05)';

  switch (variant) {
    case 'success':
      bgColor = 'var(--color-success-bg)';
      textColor = 'var(--color-success)';
      borderColor = 'rgba(16, 185, 129, 0.2)';
      break;
    case 'warning':
      bgColor = 'var(--color-warning-bg)';
      textColor = 'var(--color-warning)';
      borderColor = 'rgba(245, 158, 11, 0.2)';
      break;
    case 'critical':
      bgColor = 'var(--color-critical-bg)';
      textColor = 'var(--color-critical)';
      borderColor = 'rgba(239, 68, 68, 0.2)';
      break;
    case 'info':
      bgColor = 'var(--color-info-bg)';
      textColor = 'var(--color-info)';
      borderColor = 'rgba(59, 130, 246, 0.2)';
      break;
  }

  return (
    <span className={className} style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.15rem 0.5rem',
      borderRadius: '9999px',
      fontSize: '0.7rem',
      fontWeight: 600,
      background: bgColor,
      color: textColor,
      border: `1px solid ${borderColor}`,
      whiteSpace: 'nowrap'
    }}>
      {children}
    </span>
  );
}

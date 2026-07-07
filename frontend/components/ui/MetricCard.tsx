"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  subtext?: string;
  href?: string;
  alertState?: 'none' | 'warning' | 'critical';
  isLoading?: boolean;
  progressValue?: number; // 0-100
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  subtext,
  href,
  alertState = 'none',
  isLoading = false,
  progressValue
}: MetricCardProps) {
  
  let borderColor = 'var(--glass-border)';
  let bgGradient = 'var(--bg-surface)';
  let iconColor = 'var(--text-muted)';
  
  if (alertState === 'warning') {
    borderColor = 'rgba(245, 158, 11, 0.4)';
    bgGradient = 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(30,30,40,0.8) 100%)';
    iconColor = 'var(--color-warning)';
  } else if (alertState === 'critical') {
    borderColor = 'rgba(239, 68, 68, 0.4)';
    bgGradient = 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(30,30,40,0.8) 100%)';
    iconColor = 'var(--color-critical)';
  }

  const CardContent = (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
      transition={{ duration: 0.2 }}
      style={{
        background: bgGradient,
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--border-radius)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        backdropFilter: 'blur(10px)',
        height: '100%',
        cursor: href ? 'pointer' : 'default'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, margin: 0 }}>
          {title}
        </h4>
        {Icon && <Icon size={18} style={{ color: iconColor }} />}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-info)', borderRadius: '50%' }}
              />
              <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>{value}</span>
            </div>
          ) : (
            <span style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', lineHeight: 1 }}>
              {value}
            </span>
          )}
          {subtext && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
              {subtext}
            </span>
          )}
        </div>
        
        {progressValue !== undefined && (
          <div style={{ position: 'relative', width: '40px', height: '40px' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
              <motion.path 
                initial={{ strokeDasharray: '0, 100' }}
                animate={{ strokeDasharray: `${progressValue}, 100` }}
                transition={{ duration: 1, ease: "easeOut" }}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                stroke="var(--color-success)" 
                strokeWidth="3" 
              />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );

  if (href) {
    return <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>{CardContent}</Link>;
  }

  return CardContent;
}
